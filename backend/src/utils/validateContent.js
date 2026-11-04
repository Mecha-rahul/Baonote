import ApiError from "./apiError.js";

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v) => typeof v === "string";


const validateContent = (type, content) => {
  if (!isObject(content)) {
    throw new ApiError(400, "content must be an object");
  }

  switch (type) {
    case "note":
      if (!isString(content.text)) {
        throw new ApiError(400, "note.text must be a string");
      }
      break;

    case "todo":
      if (!isString(content.title)) {
        throw new ApiError(400, "todo.title must be a string");
      }
      if (!Array.isArray(content.items)) {
        throw new ApiError(400, "todo.items must be an array");
      }
      if (
        !content.items.every(
          (it) =>
            isObject(it) &&
            isString(it.id) &&
            isString(it.text) &&
            typeof it.done === "boolean"
        )
      ) {
        throw new ApiError(
          400,
          "each todo item needs id (string), text (string) and done (boolean)"
        );
      }
      break;

    case "code":
      if (!isString(content.language) || !isString(content.code)) {
        throw new ApiError(400, "code.language and code.code must be strings");
      }
      break;

    case "link":
      if (!isString(content.url) || !isString(content.title)) {
        throw new ApiError(400, "link.url and link.title must be strings");
      }
      break;

    case "image":
      if (!isString(content.url)) {
        throw new ApiError(400, "image.url must be a string");
      }
      break;

    default:
      throw new ApiError(400, "Unknown card type");
  }
};

export default validateContent;