const errorList = {
  UNAUTHORIZED: {
    code: 401,
    message: 'User is not authorized',
  },
  WRONG_ROLE: {
    code: 403,
    message: "You haven't got permission",
  },
  BAD_REQUEST: {
    code: 400,
    message: 'Wrong data sent',
  },
  NOT_FOUND: {
    code: 404,
    message: 'Not Found',
  },
  INTERNAL: {
    code: 500,
    message: 'Unexpected error',
  },
};

export default errorList;
