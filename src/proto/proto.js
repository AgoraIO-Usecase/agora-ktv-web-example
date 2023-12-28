/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * MsgType enum.
 * @exports MsgType
 * @enum {number}
 * @property {number} UNKNOWN_TYPE=0 UNKNOWN_TYPE value
 * @property {number} LRC_TIME=1001 LRC_TIME value
 */
export const MsgType = $root.MsgType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "UNKNOWN_TYPE"] = 0;
    values[valuesById[1001] = "LRC_TIME"] = 1001;
    return values;
})();

export const LrcTime = $root.LrcTime = (() => {

    /**
     * Properties of a LrcTime.
     * @exports ILrcTime
     * @interface ILrcTime
     * @property {MsgType|null} [type] LrcTime type
     * @property {boolean|null} [forward] LrcTime forward
     * @property {number|Long|null} [ts] LrcTime ts
     * @property {number|null} [songId] LrcTime songId
     */

    /**
     * Constructs a new LrcTime.
     * @exports LrcTime
     * @classdesc Represents a LrcTime.
     * @implements ILrcTime
     * @constructor
     * @param {ILrcTime=} [properties] Properties to set
     */
    function LrcTime(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * LrcTime type.
     * @member {MsgType} type
     * @memberof LrcTime
     * @instance
     */
    LrcTime.prototype.type = 0;

    /**
     * LrcTime forward.
     * @member {boolean} forward
     * @memberof LrcTime
     * @instance
     */
    LrcTime.prototype.forward = false;

    /**
     * LrcTime ts.
     * @member {number|Long} ts
     * @memberof LrcTime
     * @instance
     */
    LrcTime.prototype.ts = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * LrcTime songId.
     * @member {number} songId
     * @memberof LrcTime
     * @instance
     */
    LrcTime.prototype.songId = 0;

    /**
     * Creates a new LrcTime instance using the specified properties.
     * @function create
     * @memberof LrcTime
     * @static
     * @param {ILrcTime=} [properties] Properties to set
     * @returns {LrcTime} LrcTime instance
     */
    LrcTime.create = function create(properties) {
        return new LrcTime(properties);
    };

    /**
     * Encodes the specified LrcTime message. Does not implicitly {@link LrcTime.verify|verify} messages.
     * @function encode
     * @memberof LrcTime
     * @static
     * @param {ILrcTime} message LrcTime message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LrcTime.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.forward != null && Object.hasOwnProperty.call(message, "forward"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.forward);
        if (message.ts != null && Object.hasOwnProperty.call(message, "ts"))
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.ts);
        if (message.songId != null && Object.hasOwnProperty.call(message, "songId"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.songId);
        return writer;
    };

    /**
     * Encodes the specified LrcTime message, length delimited. Does not implicitly {@link LrcTime.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LrcTime
     * @static
     * @param {ILrcTime} message LrcTime message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LrcTime.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a LrcTime message from the specified reader or buffer.
     * @function decode
     * @memberof LrcTime
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LrcTime} LrcTime
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LrcTime.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LrcTime();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.type = reader.int32();
                    break;
                }
            case 2: {
                    message.forward = reader.bool();
                    break;
                }
            case 3: {
                    message.ts = reader.int64();
                    break;
                }
            case 4: {
                    message.songId = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a LrcTime message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LrcTime
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LrcTime} LrcTime
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LrcTime.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Creates a LrcTime message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LrcTime
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LrcTime} LrcTime
     */
    LrcTime.fromObject = function fromObject(object) {
        if (object instanceof $root.LrcTime)
            return object;
        let message = new $root.LrcTime();
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "UNKNOWN_TYPE":
        case 0:
            message.type = 0;
            break;
        case "LRC_TIME":
        case 1001:
            message.type = 1001;
            break;
        }
        if (object.forward != null)
            message.forward = Boolean(object.forward);
        if (object.ts != null)
            if ($util.Long)
                (message.ts = $util.Long.fromValue(object.ts)).unsigned = false;
            else if (typeof object.ts === "string")
                message.ts = parseInt(object.ts, 10);
            else if (typeof object.ts === "number")
                message.ts = object.ts;
            else if (typeof object.ts === "object")
                message.ts = new $util.LongBits(object.ts.low >>> 0, object.ts.high >>> 0).toNumber();
        if (object.songId != null)
            message.songId = object.songId | 0;
        return message;
    };

    /**
     * Creates a plain object from a LrcTime message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LrcTime
     * @static
     * @param {LrcTime} message LrcTime
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LrcTime.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.type = options.enums === String ? "UNKNOWN_TYPE" : 0;
            object.forward = false;
            if ($util.Long) {
                let long = new $util.Long(0, 0, false);
                object.ts = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.ts = options.longs === String ? "0" : 0;
            object.songId = 0;
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.MsgType[message.type] === undefined ? message.type : $root.MsgType[message.type] : message.type;
        if (message.forward != null && message.hasOwnProperty("forward"))
            object.forward = message.forward;
        if (message.ts != null && message.hasOwnProperty("ts"))
            if (typeof message.ts === "number")
                object.ts = options.longs === String ? String(message.ts) : message.ts;
            else
                object.ts = options.longs === String ? $util.Long.prototype.toString.call(message.ts) : options.longs === Number ? new $util.LongBits(message.ts.low >>> 0, message.ts.high >>> 0).toNumber() : message.ts;
        if (message.songId != null && message.hasOwnProperty("songId"))
            object.songId = message.songId;
        return object;
    };

    /**
     * Converts this LrcTime to JSON.
     * @function toJSON
     * @memberof LrcTime
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LrcTime.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for LrcTime
     * @function getTypeUrl
     * @memberof LrcTime
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    LrcTime.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/LrcTime";
    };

    return LrcTime;
})();

export { $root as default };
