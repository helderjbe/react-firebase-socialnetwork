const db = {
  usersPublic: [
    {
      name: 'John Smith',
      avatar: true,
      createdAt: '2019-03-15T10:59:52.798Z',
      bio: 'Hello, my name is user, nice to meet you',
      interests: 'Software, Web Development, Freelancing',
      location: 'London, UK',
      facebook: 'johnsmith',
      instagram: '@loler',
      twitter: '@mega',
      linkedin: ''
    }
  ],
  usersPrivate: [
    {
      groups: []
    }
  ],
  groupsPublic: [
    {
      banner: true,
      title: 'Amazing Self-Dev',
      details: 'We are an amazing self-development group',
      limit: 6,
      questions: ['What is 1+1?', 'Do you like nuggets?'],
      memberCount: 6,
      tags: 'Self-improvement, Self-dev, Game',
      reportedBy: Subcollection(
        ['23r23f4', 'Cursing in description'],
        ['32rd4qasdf', 'Bad ppls']
      ),
      createdAt: '2019-03-15T10:59:52.798Z'
    }
  ],
  groupsPrivate: [
    {
      admins: ['54ui2uhh2234io5', '2134h1243i41h2uh', 'j2314hui2h314'],
      members: ['3124435uh43i5', 'f89uw9fw423']
    }
  ],
  notifications: [
    {
      from: 'h3ih64iu6',
      to: '25g246223g4',
      read: 'true | false',
      groupId: 'h213421h34ik',
      type: 'join | left | application | message',
      createdAt: '2019-03-15T10:59:52.798Z'
    }
  ]
};
