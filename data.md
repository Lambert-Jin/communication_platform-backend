```javascript
let data = {
    
    users:[
        {
            email:'z5395008@ad.unsw.edu.au', 
            password: '111111', 
            authUserId: 1, 
            nameFirst: 'YIJIN', 
            nameLast: 'CHEN', 
            handleStr: 'yijinchen',
            token: []
        }
    ],
    
    channels:[
        {
            channelId: 1, 
            name: 'BOOST', 
            isPublic: false, 
            ownerMembers:[
                {
                    uId: 1,
                }
            ],
            allMembers: [
                {
                    uId: 1,
                }
            ],
            messages: [
                {
                    messageId: 1,
                    uId: 1,
                    message: 'Hello,world',
                    timeSent: 1, 
                }
            ],
        }
    ],
}
```

[Optional] short description:  
variable name           Type
email                   string
password                string
authUserId              integer
nameFirst               string
nameLast                string

channelId               integer
name                    integer
isPublic                boolean
uId                     integer
handIeStr               string
messageId               integer
message                 string
timeSent                integer

start                   integer
end                     integer
