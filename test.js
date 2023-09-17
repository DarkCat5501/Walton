const users = [
    {
        who: "vera",
        message:{
            kind:"text",
            text:"hello"
        },
    },
    {
        who:"lead",
        messages:[
            { kind:"text",text:"Eu fiz tal coisa"},
            { kind:"template", template: { value: 1.0 }},
        ]
    }
];



function handleTempla(tmpl){
    console.log("this is a template, we dont whow");
}

function showMessage(who, msg){

    if(who) console.log(who,":")
    switch(msg.kind){
        case "text": console.log(msg.text);break;
        case "template": handleTempla(msg.template);break;
        default: console.log(":unde");break;
    }
}

for(const user of users){
 
    //tratamento de usuário
    if(user.message){
        showMessage(user.who, user.message);
    } else if(user.messages){
        console.log(`${user.who}:`);
       user.messages.forEach(msg => showMessage(undefined, msg)) 
    }
}
