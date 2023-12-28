import { assert, expect, test, beforeAll, afterAll, afterEach, vi, beforeEach } from "vitest";
import { setupServer } from 'msw/node'
import { HttpResponse, graphql, http } from 'msw'

const posts = [
  {
    userId: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body',
  },
]

export const restHandlers = [
  http.get('https://rest-endpoint.example/path/to/posts', () => {
    return HttpResponse.json(posts)
  }),
]

const graphqlHandlers = [
  graphql.query('ListPosts', () => {
    return HttpResponse.json(
      {
        data: { posts },
      },
    )
  }),
]

function executeAfterTwoHours(func) {
  setTimeout(func, 1000  * 5 ) // 2 hours
}

function executeEveryMinute(func) {
  setInterval(func, 1000 * 60) // 1 minute
}



const server = setupServer(...restHandlers, ...graphqlHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  server.resetHandlers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const mock = vi.fn(() => console.log('executed'))


test("test1", async () => {
  const res = await fetch('https://rest-endpoint.example/path/to/posts')
    .then(res => res.json())
  expect(res).toMatchInlineSnapshot(`
      [
        {
          "body": "first post body",
          "id": 1,
          "title": "first post title",
          "userId": 1,
        },
      ]
    `)
});


test("test2", async () => {
  const date = new Date(2000, 1, 1)
  vi.setSystemTime(date)


  let data = new Date()
  expect(data).toMatchInlineSnapshot('2000-01-31T16:00:00.000Z')
})



test("test3", async () => {
  const date = new Date(2000, 1, 1)
  vi.setSystemTime(date)

  let start = new Date()
  expect(start).toMatchInlineSnapshot('2000-01-31T16:00:00.000Z')
  executeAfterTwoHours(mock)
  vi.runAllTimers()
  expect(mock).toHaveBeenCalledTimes(1)
  let end = new Date()
  expect(end).toMatchInlineSnapshot('2000-01-31T16:00:05.000Z')
})
