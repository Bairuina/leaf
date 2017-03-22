import React, {Component} from 'react';
import {Link} from 'react-router';
import {Button, Tabs, Icon, Popconfirm, message, Tooltip } from 'antd';

import EditContentTable from './EditContentTable';

import styles from './Repo.less';

import { request, API } from '../../services/request';

class Repo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      repoData: {},
      draftDocs: [],
      userInfo: {},
      isCollected: false
    };

    this.repoId = this.props.location.query.repoid;
    this.userId = this.props.location.query.userId;
  }

  componentDidMount() {
    Promise.all([
      this.getRepoInfo(),
      this.getRepoDoc(),
      this.getUserInfo()
    ]).then(data => {
      let isCollected = this.judgeIsCollected(data[2]);
      this.setState({repoData: data[0], draftDocs: data[1], userInfo: data[2], isCollected});
    });
  }

  // 获取用户信息
  getUserInfo() {
    return request({
      url: `${API}/api/user/${this.userId}`,
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
      console.log(data);
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
      console.log(collectionIds);
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
        <Link to={`/doc/view?docid=${item._id}&flag=draft`} key={item._id}>
          <p>
            {item.info.title}

            <Popconfirm title="确定删除该文档吗？" onConfirm={this.confirmDelete.bind(this, item._id)} okText="Yes" cancelText="No">
              <Icon type="close" className="icon-delete-doc"/>
            </Popconfirm>

            <Link to={`/doc/edit?repoid=${this.repoId}&docid=${item._id}&flag=e`}>
              <Icon type="edit" className="icon-edit-doc"/>
            </Link>
          </p>
        </Link>
      );
    });
  }

  render() {
    let {repoData, isCollected} = this.state;

    let iconColorClass = isCollected ? 'collected' : '';

    return (
      <div className={styles.repoContainer}>
        <Link to={`/doc/edit?repoid=${this.repoId}&flag=c`}>
          <Button type="primary" className="create-doc-button">
            新建文档
          </Button>
        </Link>

        <div className="repo-content">
          <div><Icon type="smile-o" className={`icon-collect ${iconColorClass}`} onClick={this.handleCollectRepo.bind(this)}/><p className="word-collect">收藏</p></div>

          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="目录" key="1">
              <div className="tab-pane-content">
                <p className="repoName">
                  {repoData.repoName}
                </p>
                <p className="repoIntro">
                  {repoData.intro}
                </p>
                <div className="docs">
                  <EditContentTable repoId={this.repoId} />
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="草稿" key="2">
              <div className="">
                <p className="repoName">
                  {repoData.repoName}
                </p>
                <div className="docs">
                  {this.renderDraftDocList()}
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="设置" key="3">Content of Tab Pane 3</Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Repo;
