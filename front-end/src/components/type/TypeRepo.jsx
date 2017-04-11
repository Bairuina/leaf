import React, {Component} from 'react';
import { Link, browserHistory } from 'react-router';

import {
  Button,
  Card,
  message,
  Alert
} from 'antd';

import styles from './TypeRepo.less';
import Bread from '../../common/Bread.jsx';

import {request, API} from '../../services/request';

const userId = sessionStorage.getItem('userId');

class TypeRepo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      repoList: [],
      teamList: [],
      displayNotice: 'none'
    };

    this.labelId = this.props.location.query.labelId;
    this.labelName = '';
    this.repoNumber = '';
    this.teamNumber = '';
  }

  componentDidMount() {
    Promise.all([this.fetchTypeRepos(), this.fetchLabelName()]).then(data => {
      let repos = data[0];
      let label = data[1];

      this.labelName = label.labelName;

      let repoList = [];
      // 属于当前标签的仓库
      repos.forEach((item) => {
        let labels = item.labels;
        let label = labels.filter(labelItem => {
          return labelItem.labelId === this.labelId;
        })

        if(label.length > 0) {
          if(!item.isPrivate && item.isBelongToTeam) {
            repoList.push(item);
          }
        }
      })

      this.repoNumber = repoList.length;

      let getTeamArr = [];
      // 团队
      repoList.forEach((item) => {
        if(!!item.isBelongToTeam) {
          getTeamArr.push(this.fetchTeamData(item.teamId));
        }
      })

      Promise.all(getTeamArr).then(teamsData => {
        this.teamNumber = teamsData.length;
        let displayNotice = repoList.length > 0 ? 'none' : 'block';
        this.setState({repoList, teamList: teamsData, displayNotice});
      })
    }, (err) => {
      console.log(err);
    })
  }

  // 获取仓库
  fetchTypeRepos() {
    return request({
      url: `${API}/api/repo`,
    })
  }

  // 获取团队信息
  fetchTeamData(teamId) {
    return request({
      url: `${API}/api/team/${teamId}`
    })
  }

  // 获取标签名称
  fetchLabelName() {
    return request({
      url: `${API}/api/label/${this.labelId}`
    })
  }

  render() {
    let { repoList, teamList, displayNotice } = this.state;

    let typeMessage = (
      <div className="">
        <p className="subHeader-title">{this.labelName}</p>
        <p>
          {this.repoNumber}个仓库，{this.teamNumber}个团队
        </p>
      </div>
    )

    return (
      <div className={styles.container}>
        <div className="subHeader">
          <Alert message={typeMessage} type="success" />
        </div>

        <div className="left-side">
          <Card title="仓库列表">
            {
              repoList.length > 0 ? (
                <ul>
                  {
                    repoList.map((item, index) => {
                      return (
                        <li key={index}><Link to={`/repo?repoId=${item._id}&userId=${userId}`}>{item.repoName}</Link></li>
                      )
                    })
                  }
                </ul>
              ) : null
            }

            <p className="none-notice" style={{display: displayNotice}}>暂时没有该类型的仓库</p>
          </Card>
        </div>

        <div className="right-side">
          <Card title="团队">
            {
              teamList.length > 0 ? (
                <ul>
                  {
                    teamList.map((item, index) => {
                      return (
                        <li key={index}><Link to={`/team?teamId=${item._id}&userId=${userId}`}><img src={item.avatar} alt="" />{item.name}</Link></li>
                      )
                    })
                  }
                </ul>
              ) : null
            }

            <p className="none-notice" style={{display: displayNotice}}>暂无团队</p>
          </Card>
        </div>
      </div>
    );
  }
}

export default TypeRepo;