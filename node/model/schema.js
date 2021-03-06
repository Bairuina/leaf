const mongoose = require('mongoose');

// 用户信息表结构
exports.userSchema = new mongoose.Schema({
  info: {
    avatar: { type: String },
    nickName: { type: String, require: true },
    name: { type: String },
    email: { type: String, unique: true },
    job: { type: String },
    department: { type: String }
  },
  openId: { type: String, unique: true, require: true },
  collectedReposIds: [{type: String}]
});

// 团队信息表结构
exports.teamSchema = new mongoose.Schema({
  members: [
    {
      authority: { type: String, require: true },
      userId: { type: String, require: true }
    }
  ],
  name: {type: String, require: true},
  avatar: {type: String},
  intro: {type: String},
  isPrivate: {type: Boolean, default: false}
});

// 仓库信息表结构
exports.repoSchema = new mongoose.Schema({
  repoName: { type: String, require: true },
  labels: [
    {
      labelId: { type: String },
      labelName: { type: String }
    }
  ],
  intro: { type: String },
  creatorId: { type: String, require: true },
  teamId: { type: String },
  isBelongToTeam: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  tableOfContents: [
    {
      rank: { type: Number, default: 1 },
      docId: { type: String, require: true }
    }
  ]
});

// 文档信息表结构
exports.docSchema = new mongoose.Schema({
  repoId: { type: String, require: true },
  creatorId: { type: String, require: true },
  pageView: { type: Number, default: 0 },
  datePageView: [
    {
      pageView: { type: Number, default: 0 },
      date: { type: String }
    }
  ],
  info: {
    title: { type: String },
    publishContent: { type: String },
    draftContent: { type: String },
    publishTime: { type: String },
    saveTime: { type: String }
  }
});

// 标签表结构
exports.labelSchema = new mongoose.Schema({
   labelName: { type: String, default: '其他' },
   index: { type: Number, default: 9},
   description: { type: String, default: '油盐酱醋，诗酒花茶'}
})
