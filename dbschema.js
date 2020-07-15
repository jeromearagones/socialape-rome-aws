let db = {
    users: [
        {
            userId: `dasdjojh13123123`,
            email: `user@email.com`,
            handle: `user`,
            createdAt: `2020-07-07T03:07:42.389Z`,
            imageURL: `image/adhiqhidqd/dqdqfq`,
            bio: `Hello, my name is user, nice to meet you`,
            website: `https://user.com`,
            location: `Cebu, PH`
        }
    ],
    
    screams: [
        {
            userHandle: `user`,
            body: `this is a scream body`,
            createdAt: `2020-07-07T03:07:42.389Z`,
            likeCount: 5,
            commentCount:2
        }
    ],

    comments: [
        {
            userHandle: `user`,
            screamId: 'dhubbadindninin',
            body: `nice one mate!`,
            createdAt: `2020-07-07T03:07:42.389Z`
        }
    ],
    notification: [
        {
            recipient: `user`,
            sender: `john`,
            read: `true | false`,
            screamId: `dsinfosnfnsnmsmc`,
            type: `like | comment`,
            createdAt: `2020-07-07T03:07:42.389Z`
        }
    ]
};

const userDetails = {
    //Redux data
    credentials: {
        userId: `dasdjojh13123123`,
        email: `user@email.com`,
        handle: `user`,
        createdAt: `2020-07-07T03:07:42.389Z`,
        imageURL: `image/adhiqhidqd/dqdqfq`,
        bio: `Hello, my name is user, nice to meet you`,
        website: `https://user.com`,
        location: `Cebu, PH`
    },
    likes: [
        {
            userhandle: `user`,
            screamId: `fji14254hi42n4n2n4`
        },
        {
            userhandle: `user`,
            screamId: `fifnnn5jn35jnn5jkbb`
        }
    ]
}