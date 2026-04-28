import moment from "moment-timezone";

export const formatDate = (date: string | Date, format: string) => {
  return moment(date).format(format);
};
export const dateTimeNow = () => {
  return moment(new Date()).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss ZZ");
};
