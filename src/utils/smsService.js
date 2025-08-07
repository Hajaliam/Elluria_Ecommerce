// src/utils/smsService.js
const Kavenegar = require('kavenegar');
const { logger, sendLoginLogger } = require('../config/logger');

class SmsService {
    constructor() {
        this.kavenegarAPI = Kavenegar.KavenegarApi({
            apikey: process.env.SMS_API_KEY,
        });
    }

    async sendSms(user, message,type ="sms") {
        const smsMessage = `${user.first_name} عزیز\n${message}`;

        return new Promise((resolve, reject) => {
            this.kavenegarAPI.Send(
                {
                    message: smsMessage,
                    sender: process.env.SMS_SENDER_NUMBER,
                    receptor: user.phone_number,
                },
                (response, status) => {
                    if (status === 200) {
                        logger.info(`پیامک به ${user.phone_number} ارسال شد.`);
                         if (type ==="OTP"){
                             sendLoginLogger.info(`کد ورود به شماره ${user.phone_number} ارسال شد`);
                         } else{
                             sendLoginLogger.info(`پیامک بازیابی رمز عبور به شماره ${user.phone_number} ارسال شد`);
                         }
                        resolve(response);
                    }else {
                        logger.error(`خطا در ارسال پیامک به ${user.phone_number}: ${JSON.stringify(response)}`);
                        reject(new Error('ارسال پیامک ناموفق بود.'));
                    }
                }
            );
        });
    }

    async sendPasswordResetCode(user, resetCode) {
        const message = `کد بازیابی رمز عبور شما در الوریا: ${resetCode}\nاعتبار این کد ${process.env.OTP_EXPIRES_IN_MINUTES} دقیقه می‌باشد.`;
        return this.sendSms(user, message);
    }

    async sendOtpCode(user,otpCode){
        const type = "OTP" ;
        const message = `کد ورود شما به الوریا: ${otpCode} \nاعتبار این کد ${process.env.OTP_EXPIRES_IN_MINUTES} دقیقه می‌باشد.` ;
        return this.sendSms(user, message ,type);
    }
}

module.exports = new SmsService();
