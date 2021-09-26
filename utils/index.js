export const checkUserType = (usertype) => {
  const _userType = usertype?.split("_");
  if (_userType?.length) {
    if (_userType.length > 1) {
      return `${_userType[0]} ${_userType[1]}`;
    } else {
      return `${_userType[0]}`;
    }
  } else {
    return "";
  }
};
