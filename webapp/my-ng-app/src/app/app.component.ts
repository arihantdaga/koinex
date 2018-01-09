import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { _throw } from 'rxjs/observable/throw';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/operator/map';
// import { FormControl } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Pusher from "pusher-js";
import { WindowRef } from '../providers/windowRef';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Koinex Notifications App';
  limits: any;
  url: string;
  errorMessage: string = null;
  addLimitForm: FormGroup;
  currencies: [string];
  pusherClient: any;
  config: any;
  notificationGap: any;

  constructor(private http:HttpClient, private fb : FormBuilder, private winRef: WindowRef){
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
    this.currencies = ["ripple", "ether", "bcash"];

    this.createForm();
    this.url = this.winRef.nativeWindow.url;
    this.fetchLimits("ripple");
    this.initPusher();
    this.bindCurrency("ripple");

    this.notificationGap = 15000 // 10*60*1000;      // 10 Minitues

  }
  initPusher(){
    this.pusherClient = new Pusher(this.config.pusher_key,{
        cluster: "ap2"
        });  
  }
  subscribePusher(topic){
      return this.pusherClient.subscribe(topic);
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
          // console.log(t.message);
          if(!this.limits || !Object.keys(this.limits).length){
              return;
          }
          let data = t.message.data;

          if(data && data.last_traded_price){
              let key = `${currency}`;
              this.limits[key].map(limit=>{
                  // console.log(limit);
                  let message = null;
                  if(!limit.active){
                    return;
                  }
                  if((limit.lt && limit.lt >= data.last_traded_price) || (limit.gt && limit.gt <= data.last_traded_price)){
                      if(!limit.notificationSent || Date.now()-limit.notificationSent > this.notificationGap){
                          message = `Currency Rate - ${data.last_traded_price}`
                          this.sendNotification("Limit Hit",{ data: {currency: currency, value: data.last_traded_price, time: Date.now()}, message:message} );
                          limit.notificationSent = Date.now();  
                      }   
                  }
              })
          }

      });
  }
  sendNotification(topic, data){
      console.log("Sending Notification");
      console.log(topic);
      console.log(data.message);
      console.log(data);
      this.http.post(`${this.url}/sendNotification`, {
          message: data.message,
          topic:topic
        })
        .subscribe((response:any)=> {
          console.log(response);
          },
         (error)=>{
          console.log(error);
        });   
  }

  createForm(){
    this.addLimitForm = this.fb.group({
      currency: ["ripple"],
      type:["gt"],
      value:[0]
    })
  }
  fetchLimits(currency: string){
    this.http.get(`${this.url}/limits?currency=${currency}`)
        .subscribe((data:any) =>{
          console.log(data);
            this.limits = data ? {...data} : null;
            console.log(this.limits);
            this.errorMessage = null;
        } ,error=>{
          console.log(error);
          this.errorMessage = "Error in fetching limits";
        })
  }
  pause(limit:any){
    let data={
      _id: limit._id,
      active: false
    }
    this.http.post(`${this.url}/limit/edit`, data)
    .subscribe((data:any)=>{
      if(data && data.status == 1){
        limit.active = false;
      }
    }, error=>{
      alert("error occured in action");
      console.log(error);
    })
  }
  activate(limit:any){
    let data={
      _id: limit._id,
      active: true
    }
    this.http.post(`${this.url}/limit/edit`, data)
    .subscribe((data:any)=>{
      if(data && data.status == 1){
        limit.active = true;
      }
    }, error=>{
      alert("error occured in action");
      console.log(error);
    })
  }
  delete(limit:any, currency: string){
    let data= {
      _id: limit._id
    }
    this.http.post(`${this.url}/limit/delete`, data)
    .subscribe((data:any)=>{
      if(data && data.status == 1){
        // limit.active = true;
        let index = this.limits[currency].indexOf(limit);
        console.log(index);
        this.limits[currency].splice(index,1);
      }
    }, error=>{
      alert("error occured in action");
      console.log(error);
    })
  }

  addLimit(){
    console.log(this.addLimitForm.value);
    let data = this.addLimitForm.value;
    let sendData = {
      [data.type]: data.value,
      currency: data.currency
    };
    this.http.post(`${this.url}/limit`, sendData)
    .subscribe((data:any)=>{
      console.log(data);
      if(data && data.data){
        if(this.limits[sendData.currency] && Array.isArray(this.limits[sendData.currency])){
          this.limits[sendData.currency].push(data.data);
        }else{
          if(this.limits){
            this.limits[sendData.currency] = [data.data];
          }else{
            this.limits = {
              [sendData.currency] : [data.data]
            }
          }
        }
      }
      this.addLimitForm.reset();

    }, error=>{
      alert("error occured in action");
      console.log(error);
    })
  }

}
