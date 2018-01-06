class Koinex {
    constructor(){
        this.config = {
            "base_domain": "koinex.in",
            "protocol": "https",
            "pusher_key": "9197b0bfdf3f71a4064e",
            "version": "40",
            "razor_key": "rzp_live_E0sfVCr0a2wv1x",
            "razor_pay_active": "true",
            "syndicate_active": "false",
            "coin_decimals": "4",
            "site_maintainance": "false",
            "site_maintainance_message": "Koinex will be back at 04.00 AM."
        }
        this.limits = null;
        this.notificationGap = 15000 // 10*60*1000;      // 10 Minitues
        
        // this.notifiCtrl = new Notifications();
    }

    initPusher(){
        window.pusherClient = new Pusher(this.config.pusher_key,{
            cluster: "ap2"
        });
        
    }
    subscribePusher(topic){
        return pusherClient.subscribe(topic);
    }
    
    bindCurrency(currency){
        this.subscribePusher("my-channel-"+ currency)
        // .bind(currency + "_open_buy_orders", function(t) {
        //     // console.log(`Topic : `);
        //     console.log(t);
        //     // console.log(t.message);
        // })
        // .bind(currency + "_open_sell_orders", function(t) {
        //     console.log(t.message);
        // })
        // .bind(currency + "_order_transactions", function(t) {
        //     console.log(t.message);
        // })
        .bind(currency + "_market_data", (t) =>{
            console.log(t.message);
            if(!this.limits || !Object.keys(this.limits).length){
                return;
            }
            let data = t.message.data;

            if(data && data.last_traded_price){
                let key = `${currency}`;
                this.limits[key].map(limit=>{
                    console.log(limit);
                    let message = null;
                    if((limit.lt && limit.lt >= data.last_traded_price) || (limit.gt && limit.gt <= data.last_traded_price)){
                        if(!limit.notificationSent || Date.now()-limit.notificationSent > this.notificationGap){
                            message = `Currency Rate - ${limit.lt}`
                            this.sendNotification("Limit Hit", {currency: currency, value: data.last_traded_price, time: Date.now()});
                            limit.notificationSent = Date.now();  
                        }   
                    }
                })
            }

        });
    }

    sendNotification(topic, message){
        console.log("Sending Notification");
        console.log(topic);
        console.log(message);
        axios.post('/sendNotification', {
            message: message,
            topic:topic
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });   
    }
    fetchLimits(){
        axios.get("/limits")
        .then(data=>{
            this.limits = data && data.data ? {...data.data} : null;
        }).catch(err=>{
            console.log(err);
        })
    }


    initGame(){
        this.initPusher();
        this.fetchLimits();
        this.bindCurrency("ripple");
    }
}

let game = new Koinex();
game.initGame();








