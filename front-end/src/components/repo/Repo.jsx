import React, {Component} from 'react';
import { Link, browserHistory } from 'react-router';
import { Button, Tabs, Icon, Popconfirm, message, Tooltip } from 'antd';

import EditContentTable from './EditContentTable';
import Bread from '../../common/Bread.jsx';

import styles from './Repo.less';

import { request, API } from '../../services/request';

class Repo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      repoData: {},
      draftDocs: [],
      userInfo: {},
      isCollected: false,
      avatar: '',
      name: '',
      teamRepo: false
    };

    this.repoId = this.props.location.query.repoId;
    this.userId = sessionStorage.getItem('userId');
    this.fromlabel = this.props.location.query.fromlabel || '';
    this.guide = this.props.location.query.guide || '';
    this.currentUserId = sessionStorage.getItem('userId');
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    Promise.all([
      this.getRepoInfo(),
      this.getRepoDoc(),
      this.getUserInfo(this.userId)
    ]).then(data => {
      let isCollected = this.judgeIsCollected(data[2]);

      data[1].sort((a, b) => {
        return new Date(b.info.saveTime).getTime() - new Date(a.info.saveTime).getTime();
      })

      // 创建人头像
      this.getUserInfo(data[0].creatorId).then(creatorInfo => {
        this.setState({
          avatar: creatorInfo.info.avatar,
          name: creatorInfo.info.name || creatorInfo.info.nickName
        });
      })

      this.setState({
        repoData: data[0] || {},
        draftDocs: data[1] || [],
        userInfo: data[2] || {},
        isCollected
      });
    }).catch(err => {
      console.log(err);
    });
  }

  // 获取用户信息
  getUserInfo(userId) {
    return request({
      url: `${API}/api/user/${userId}`
    });
  }

  getTeamInfo(teamId) {
    return request({
      url: `${API}/api/team/${teamId}`
    });
  }

  // 获取仓库
  getRepoInfo() {
    return request({
      url: `${API}/api/repo/${this.repoId}`
    });
  }

  // 获取仓库文档
  getRepoDoc() {
    return request({
      url: `${API}/api/doc?repoId=${this.repoId}`
    });
  }

  // 确认删除文档
  confirmDelete(docId) {
    request({
      url: `${API}/api/doc/${docId}`,
      method: 'delete'
    }).then(data => {
      message.success('删除成功');

      this.getRepoDoc().then(data => {
        this.setState({draftDocs: data});
      });
    });
  }

  // 收藏仓库 & 取消收藏
  handleCollectRepo() {
    let { userInfo, isCollected } = this.state;
    let collectionIds = userInfo.collectedReposIds;

    if(isCollected) {
      let index = collectionIds.indexOf(this.repoId);
      collectionIds.splice(index, 1);

      message.warning('已取消收藏');
      this.setState({isCollected: false});
    }else {
      collectionIds.push(this.repoId);
      message.success('收藏成功');
      this.setState({isCollected: true});
    }

    // 修改用户收藏信息
    request({
      url: `${API}/api/user/${this.userId}`,
      method: 'put',
      body: userInfo
    }).then(data => {
      console.log(data);
    });
  }

  // 判断该仓库是否被收藏
  judgeIsCollected(userInfo) {
    let collectionIds = userInfo.collectedReposIds;

    if(collectionIds.indexOf(this.repoId) !== -1) {
      return true;
    }
  }

  // 渲染草稿列表
  renderDraftDocList() {
    return this.state.draftDocs.map(item => {
      return (
        <div className="" key={item._id}>
          <Link to={`/doc/view?repoId=${this.repoId}&docId=${item._id}&flag=draft`}>
            <span>
              {item.info.title}
            </span>
          </Link>

          <div className="operate-area">
            <Link to={`/doc/edit?repoId=${this.repoId}&docId=${item._id}&userId=${this.userId}&flag=e&fromlabel=${this.fromlabel}`}>
              <Icon type="edit" className="icon-edit icon-edit-doc"/>
            </Link>

            <Popconfirm title="确定删除该文档吗？" onConfirm={this.confirmDelete.bind(this, item._id)} okText="Yes" cancelText="No">
              <Icon type="delete" className="icon-delete"/>
            </Popconfirm>

            <span className="date">{item.info.saveTime}</span>
          </div>
        </div>
      );
    });
  }

  renderHeader(repoData, avatar) {
    const { userInfo } = this.state;

    userInfo.info = userInfo.info || {};

    let showAvatar = null;
    if(avatar) {
      showAvatar = (
        <div className="avatar">
          <img src={avatar} alt="" />
        </div>
      )
    }

    return (
      <div className="">
        <p className="repoName">
          {repoData.repoName}
        </p>
        <p className="repoIntro">
          {repoData.intro}
        </p>

        {
          <Tooltip title={this.state.name} overlayClassName="repo-tooltip">
            {showAvatar}
          </Tooltip>
        }

      </div>
    )
  }

  render() {
    let {repoData, isCollected, draftDocs, avatar} = this.state;

    let iconColorClass = isCollected ? 'collected' : '';

    return (
      <div className={styles.repoContainer}>
        {
          this.fromlabel || this.guide ? null : (
            <Link to={`/doc/edit?repoId=${this.repoId}&userId=${this.userId}&flag=c`}>
              <Button type="primary" className="create-doc-button">
                新建文档
              </Button>
            </Link>
          )
        }

        <div className="repo-content">
          <div>
            <Icon type="smile-o" className={`icon-collect ${iconColorClass}`} onClick={this.handleCollectRepo.bind(this)}/>
            {
              isCollected ? (<p className="word-collect word-collected">已收藏</p>) : (
                <p className="word-collect">收藏</p>
              )
            }
          </div>

          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="目录" key="1">
              <div className="tab-pane-content">
                {this.renderHeader(repoData, avatar)}

                <div className="docs">
                  <EditContentTable repoId={this.repoId} fromlabel={this.fromlabel} guide={this.guide}/>
                </div>
              </div>
            </Tabs.TabPane>

            {
              this.fromlabel || this.guide ? null : (
                <Tabs.TabPane tab="草稿" key="2">
                  <div className="">
                    {this.renderHeader(repoData, avatar)}

                    <div className="docs">
                      {
                        draftDocs.length ? this.renderDraftDocList() : (<p className="none-notice">暂无文档</p>)
                      }
                    </div>
                  </div>
                </Tabs.TabPane>
              )
            }

          </Tabs>
        </div>
      </div>
    );
  }
}

export default Repo;
