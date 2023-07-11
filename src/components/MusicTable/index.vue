<!-- 点歌组件 将main中的MusicTable相关抽离到这个里面  -->
<template>
  <div class="musicTable">
    <i class="el-icon-close" @click="close"></i>
    <el-tabs type="border-card">
      <el-tab-pane label="点歌" class="list">
        <div v-for="item in list" :key="item.songCode" class="item">
          <div class="left">
            <div>{{ item.name }}</div>
            <div>{{ item.singer }}</div>
          </div>
          <el-button v-if="!item.select" class="noselect" @click="goOrder(item)" :disabled="!canOrder">
            <span class="order-text">点歌</span>
          </el-button>
          <div v-else class="select">已点</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="已点" class="list">
        <div v-for="(item, index) in orderMusic" :key="index" class="item">
          <div class="left">
            <div>{{ item.name }}</div>
            <div>{{ item.singer }}</div>
          </div>
          <div v-if="item.songCode == songCode" style="color: #009fff; font-size: 14px">演唱中</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>



export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    songCode: {
      type: String,
      default: "",
    },
    orderMusic: {
      type: Array,
      default: () => [],
    },
    canOrder: {
      type: Boolean,
      default: false
    }
  },
  components: {},
  data() {
    return {}
  },
  mounted() {

  },
  beforeDestroy() {
  },
  methods: {
    close() {
      this.$emit("close");
    },
    goOrder(item) {
      this.$emit("goOrder", item.songCode);
    },
  },
};
</script>
<style lang="scss">
.musicTable {
  position: absolute;
  bottom: 0px;
  left: 1px;
  right: 0;
  height: 500px;
  background: #232d61;
  border-radius: 20px 20px 0px 0px;
  color: #fff;
  text-align: right;
  background: #232d61 !important;
  z-index: 999;

  .el-icon-close {
    margin: 20px 20px 0 0;
    font-size: 24px;
  }

  .list {
    text-align: left;
    max-height: 360px;
    overflow-y: auto;

    .item {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-between;
      height: 50px;
      padding: 0 10px;
      text-align: center;

      .left {
        display: flex;
        flex-flow: column nowrap;
        align-items: flex-start;
        justify-content: space-around;

        :nth-child(1) {
          font-weight: 500;
          color: #ffffff;
          font-size: 15px;
          line-height: 21px;
        }

        :nth-child(2) {
          color: #6c7192;
          font-size: 12px;
          line-height: 17px;
        }
      }
    }

    .noselect {
      display: inline-block;
      width: 50px;
      position: relative;
      height: 28px;
      line-height: 28px;
      background: linear-gradient(180deg, #0b8af2 0%, #2753ff 100%);
      border-radius: 24px;
      font-size: 12px;
      color: #ffffff;

      .order-text {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .select {
      width: 56px;
      height: 28px;
      background-color: rgba(229, 229, 239, 0.1);
      border-radius: 24px;
      font-size: 12px;
      line-height: 28px;
      color: #ffffff;
    }
  }
}

.el-tabs--border-card,
.el-tabs__header,
.el-tabs__nav-scroll .el-tabs__item {
  background: #232d61 !important;
  border: 1px solid #232d61 !important;
}

.el-tabs__header .el-tabs__nav-scroll {
  background: #232d61 !important;
}

.el-tabs--border-card {
  box-shadow: 0 0 0 0;
}
</style>
