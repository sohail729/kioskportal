import React, { useState, useEffect, useContext } from 'react';
import styles from './Gallery.module.css';
import axios from 'axios';
import { withRouter, Link } from "react-router-dom";
import { AccountContext } from '../../../Accounts';
import Loader from 'react-loader-spinner';
import Videos from '../../../components/Videos';
import Pagination from '../../../components/Pagination';

function GalleryUser(props) {

    const { getSession, logout } = useContext(AccountContext);
    const { getCurUser } = useContext(AccountContext);

    const [videos, setVideosData] = useState([]);
    const [device_id] = useState('');
    const [showGallery, setGalleryStatus] = useState(0);

    //vidoeData
    const [user, setUser] = useState('');
    const [userGroup, setUserGroup] = useState('');

    const [loader, setLoader] = useState('');

    //Pagination 
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [videosPerPage] = useState(36);

    useEffect(() => {
        getSession()
            .then(session => {
                setLoading(true);
                setUser(session);
                setUserGroup(session.accessToken.payload["cognito:groups"][0])
                if(props.match.params.userName !== session.accessToken.payload.sub){
                    setUser('');
                    logout();
                }        
                const payload = {
                    'type': 'user',
                    'username': session['sub']

                }
                getCurUser(payload)
                    .then(userData => {
                        if (userData.result.Item.Verified !== 'Yes'){
                            props.history.push('/users/verify');
                        }
                        setGalleryStatus(1)
                        const fetchVideos = async (props) => {
                            const payload = {
                                ScanIndexForward: false,
                                'type': 'videos',
                                'username': props.match.params.userName
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
                    })
                    .catch(err => {
                        setLoader(false);
                    });
            }).catch(function (err) {
                setUser('');
                logout();
                props.history.push('/');
            });
    }, [getCurUser, getSession, logout, props]);


    // Get current posts
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo)

    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);

    const goToLogIn = () => {
        props.history.push('/');
    }
    const logOut = () => {
        setLoader(true);
        setTimeout(() => {
            setUser('');
            logout();
            props.history.push('/');
        }, 2000);

    }

    return (
        <div className="col-md-12 p-0">
        
        {
            showGallery === 1 ?
            <>
            <div className={styles.listing__header}>
                <div className="container">
                    <div className="col-md-12">
                        <div className="row">
                        <h2 className={` ${styles.page_title} `}>
                        <span>Gallery</span>
                        </h2>
                        {
                            user ?
                            <button type="button" className="ml-auto btn btn-sm btn-primary" onClick={logOut}><span> Logout </span></button>
                            : <button type="button" className="ml-auto btn btn-sm btn-primary" onClick={goToLogIn}><span> Log In </span></button>
                        }
                        
                        </div>
                    </div>
                    </div>
                    </div>
                    
                    <div className="container">

                    <div className={styles.listing__body}>


                    
                    <div className="videos_listing mt-4 row">
                    {
                        user ?
                        <div className='container'>
                        
                        <Videos device_id={device_id} userGroup={userGroup} videos={currentVideos} loading={loading} username={props.match.params.userName} />
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

                        {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}

                        </div>
                        </div>
            </div>
            </>
            : ''
            }
            
      
        </div>
    )
}

export default withRouter(GalleryUser);
