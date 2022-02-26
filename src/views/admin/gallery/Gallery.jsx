import React, { useState, useEffect, useContext } from 'react';
import { withRouter, Link } from "react-router-dom";
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import styles from './Gallery.module.css';
import axios from 'axios';
import { AccountContext } from '../../../Accounts';
import Videos from '../../../components/Videos';
import Pagination from '../../../components/Pagination';

function Gallery(props) {

    const [videos, setVideosData] = useState([]);
    const { getSession, logout } = useContext(AccountContext);
    const [userSess, setUserSession] = useState('');
    const [user, setUser] = useState('');
    const [userGroup, setUserGroup] = useState('');

    //Pagination 
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [videosPerPage] = useState(36);

    useEffect(() => {
        getSession()
            .then(session => {
                setUser(session);
                setUserSession(session);
                setUserGroup(session.accessToken.payload["cognito:groups"][0])
                const fetchVideos = async (props) => {
                    const payload = {
                        'type': 'videos',
                        'username': props.match.params.deviceId
                    }
                    setLoading(true);
                    const res = await axios.post('https://4uzxj5hhqc.execute-api.us-east-1.amazonaws.com/get_data_stage', payload)
                    var sorted = res.data.result.videos;
                    if (sorted !== undefined) {
                        sorted.sort((a, b) => {
                            if (b.created_at < a.created_at)
                                return -1;
                            if (b.created_at > a.created_at)
                                return 1;
                            return 0;
                        })
                        setVideosData(sorted);
                    }
                    setLoading(false);
                };

                fetchVideos(props);
            }).catch(function (err) {
                setUser('');
                logout();
            });
    }, [getSession, logout, props]);

    //   Get current posts
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);


    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);


    const goBack = () => {
        window.history.go(-1);
    }

    return (
        <div className="col-md-12 p-0">
            <div className={styles.listing__header}>
                <div className="container">
                    <div className="row">
                        <h2 className={` ${styles.page_title} `}>
                            <ArrowBackIcon onClick={(e) => goBack(e)} />
                            <span>  Gallery</span>
                        </h2>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className={styles.listing__body}>
                    <div className="listing__action">
                        <div className="row">
                            <button className={"btn btn-outline-primary ml-auto "}
                                onClick={goBack}
                            >
                                <span>
                                    Back
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="videos_listing row">
                            {
                                user ?
                                    <div className='container'>

                                        <Videos userSess={userSess} userGroup={userGroup} videos={currentVideos} loading={loading} username={props.match.params.deviceId} />
                                        {
                                            videos.length >= videosPerPage ?
                                                <Pagination
                                                    videosPerPage={videosPerPage}
                                                    totalVideos={videos.length}
                                                    paginate={paginate}
                                                    currentPage={currentPage}
                                                />
                                                : ''
                                        }
                                    </div>
                                    : <>  <div className="text-center"> Please Login to Continue <Link to="/">Login</Link></div></>
                            }

                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default withRouter(Gallery);
