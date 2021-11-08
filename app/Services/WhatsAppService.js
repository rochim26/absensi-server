const { default: axios } = require("axios");

class WhatsAppService {
  static async sendMessage(number, message) {
    try {
      const { data } = await axios.post(
        `https://whatsapp.smarteschool.net/send-message`,
        {
          number: `${number}@c.us`,
          message: message,
        }
      );
      return data;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}

module.exports = WhatsAppService;
