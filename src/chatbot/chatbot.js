// chatbot.js
export default class Chatbot {
  async fetchResponse(input) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("This is a response from the bot.");
      }, 1000);
    });
  }
}
