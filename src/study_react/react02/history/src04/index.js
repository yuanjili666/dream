import React from 'react';
import ReactDOM from 'react-dom';
// import {HashRouter as Router, Route, Link, Switch} from 'react-router-dom'
// 使用自定义hash路由 
import {HashRouter as Router, Route, Link, Switch} from './react-router-dom'
// 使用自定义history路由
// import {BrowserRouter as Router, Route, Link} from './react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'
import Home from './components/Home'
import User from './components/User'
import Profile from './components/Profile'

/**
 * router 使用
 * 如果路径匹配，则会渲染模板，如果不匹配，则不会渲染
 * exact: 精确匹配
 * 
 */
ReactDOM.render(<Router>
    <React.Fragment>
        <div className="container bg-light">
            <h3>管理系统</h3>
            <ul className="nav">
                <li className="nav-item">
                    <Link className="nav-link active" to="/">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/user">User</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/profile">Profile</Link>
                </li>
            </ul>
        </div>
        <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/user" component={User}/>
            <Route path="/profile" component={Profile}/>
        </Switch>
    </React.Fragment>
</Router>, document.getElementById('root'));
