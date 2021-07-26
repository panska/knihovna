import React, { useState, useEffect, useRef, useContext } from 'react';
import { Context } from '../../components/App';
import ReactPlayer from 'react-player';
import Title from '../../components/Title';
import {
  IconButton,
  Slider,
  Persona,
  PersonaSize,
  TextField,
  Facepile,
  OverflowButtonType,
} from '@fluentui/react';
import { io } from 'socket.io-client';
import { useMsal, useAccount, useIsAuthenticated } from '@azure/msal-react';

import axios from 'axios';

const VirtualniKinosal = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const isAuthenticated = useIsAuthenticated();
  const [state, dispatch] = useContext(Context);
  const [url, setUrl] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [location, setLocation] = useState(0);
  const [playing, setPlaying] = useState(false);
  const player = useRef(null);
  const [socket, setSocket] = useState(null);
  const [textMessage, setTextMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [seeked, setSeeked] = useState(0);
  const [watching, setWatching] = useState([]);
  const [lock, setLock] = useState({
    projecting: null,
    closestProjection: null,
  });

  const sliderValueFormat = (value) => {
    if (!(player && player.current)) {
      return;
    }

    return new Date(player.current.getCurrentTime() * 1000)
      .toISOString()
      .substr(11, 8);
  };

  const onChangeValue = (value) => {
    if (
      state.permissions &&
      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
    ) {
      return;
    }

    if (!(player && player.current)) {
      return;
    }

    if (!socket) {
      return;
    }

    socket.emit('controlsUpdate', {
      time: (player.current.getDuration() / 100) * value,
      playing,
      url,
    });
  };

  const sendControlsUpdate = (update) => {
    if (
      state.permissions &&
      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
    ) {
      return;
    }

    if (!(player && player.current)) {
      return;
    }

    if (!socket) {
      return;
    }

    socket.emit('controlsUpdate', {
      time: player.current.getCurrentTime(),
      playing: update,
      url,
    });
  };

  const sendTextMessage = (text) => {
    if (!socket) {
      return;
    }

    if (!account) {
      return;
    }

    socket.emit('textMessage', {
      text,
      user: state,
      date: new Date(),
    });
  };

  const toggleFullScreen = () => {
    let player = document.getElementById('videoplayer');

    if (!document.mozFullScreen && !document.webkitFullScreen) {
      if (player.mozRequestFullScreen) {
        player.mozRequestFullScreen();
      } else {
        player.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else {
        document.webkitCancelFullScreen();
      }
    }
  };

  useEffect(() => {
    axios.get('/api/projection/all').then((res) => {
      let current = res.data.filter((projection) => {
        let from = new Date();
        let to = new Date();
        to.setHours(to.getHours() + 4);

        return (
          new Date(projection.start) < from && new Date(projection.start) < to
        );
      });

      let diffdate = new Date();
      let sorted = res.data.sort((a, b) => {
        let distancea = Math.abs(diffdate - new Date(a.start));
        let distanceb = Math.abs(diffdate - new Date(b.start));
        return distancea - distanceb;
      });
      let future = sorted.filter((d) => {
        return new Date(d.start) - diffdate > 0 && d.type != 'živá';
      });

      setLock({ projecting: current[0], closestProjection: future[0] });
    });

    for (let persona of document.getElementsByClassName('ms-Persona')) {
      for (let className of persona.classList) {
        if (className.startsWith('root')) {
          persona.classList.remove(className);
        }
      }
    }

    const socket = io();
    setSocket(socket);

    socket.on('connect', () => {
      if (!state.username) {
        return;
      }

      socket.emit('userJoin', state);
    });

    socket.on('userJoin', (user) => {
      setMessages((messages) => [
        ...messages,
        {
          text: `${user.username} vstoupil do kinosálu`,
          type: 'announcement',
        },
      ]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      setWatching((watching) => [
        ...watching,
        {
          id: socket.id,
          personaName: user.username,
          imageUrl: user.profilePicture,
          permissions: user.permissions,
        },
      ]);
    });

    socket.on('userDisconnect', (user) => {
      if (!user) {
        return;
      }

      const newWatching = watching.filter((_user) => _user.id !== user.id);
      setWatching(newWatching);

      setMessages((messages) => [
        ...messages,
        {
          text: `${user.username} odešel z kinosálu`,
          type: 'announcement',
        },
      ]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    socket.on('userUpdate', (users) => {
      if (watching == users) {
        return;
      }

      setWatching(
        users.map((user) => {
          return {
            id: socket.id,
            personaName: user.username,
            imageUrl: user.profilePicture,
            permissions: user.permissions,
          };
        })
      );
    });

    socket.on('controlsUpdate', (update) => {
      if (url !== update.url) {
        setUrl(update.url);
      }

      if (!update.time) {
        update.time = 0;
      }

      if (!(player && player.current && player.current.getInternalPlayer())) {
        return;
      }

      player.current.seekTo(update.time, 'seconds');
      setSeeked(update.time);
      setLocation((update.time / player.current.getDuration()) * 100);
      if (update.playing) {
        player.current.getInternalPlayer().play();
        setPlaying(true);
      } else {
        player.current.getInternalPlayer().pause();
        setPlaying(false);
      }
    });

    socket.on('mediaUpdate', (update) => {
      if (
        state.permissions &&
        state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
      ) {
        return;
      }

      if (url !== update.url) {
        setUrl(update.url);
      }

      if (!(player && player.current && player.current.getInternalPlayer())) {
        return;
      }

      if (!update.playing && playing) {
        player.current.seekTo(update.time, 'seconds');
        setSeeked(update.time);
        setLocation((update.time / player.current.getDuration()) * 100);
        player.current.getInternalPlayer().pause();
        setPlaying(false);
        return;
      }

      let time = player.current.getCurrentTime();
      let diff = update.time - time;

      if (diff > 2) {
        player.current.seekTo(update.time, 'seconds');
        setSeeked(update.time);
        setLocation((update.time / player.current.getDuration()) * 100);
        player.current.getInternalPlayer().play();
        setPlaying(true);
      } else if (diff < -2) {
        player.current.seekTo(update.time + 1, 'seconds');
        setSeeked(update.time);
        setLocation((update.time / player.current.getDuration()) * 100);
        player.current.getInternalPlayer().play();
        setPlaying(true);
      }
    });

    socket.on('textMessage', (message) => {
      console.log(message);

      if (
        !(message.text && message.user && message.date) ||
        message.type == 'announcement'
      ) {
        return;
      }

      setMessages((messages) => [...messages, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    const sliderUpdate = setInterval(() => {
      if (!(player && player.current)) {
        return;
      }

      setLocation(
        (player.current.getCurrentTime() / player.current.getDuration()) * 100
      );
    }, 1);

    const mediaUpdate = setInterval(() => {
      if (
        state.permissions &&
        !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
      ) {
        return;
      }

      if (!(player && player.current)) {
        return;
      }

      if (!socket) {
        return;
      }

      socket.emit('mediaUpdate', {
        time: player.current.getCurrentTime(),
        playing,
        url,
      });
    }, 1000);

    return () => {
      clearInterval(sliderUpdate);
      clearInterval(mediaUpdate);
      socket.disconnect();
      setSocket(null);
    };
  }, [isAuthenticated]);

  if (lock.projecting) {
    if (account) {
      return (
        <>
          <Title text='Virtuální kinosál' />
          <div className='cinema'>
            <div className='hall'>
              <div className='player'>
                <ReactPlayer
                  id='videoplayer'
                  url={url}
                  controls={true}
                  ref={player}
                  onReady={() => {
                    if (document.getElementsByClassName('vp-sidedock')) {
                      document
                        .getElementsByClassName('vp-sidedock')[0]
                        .remove();
                    }
                  }}
                  height={
                    state.permissions &&
                    state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                      ? 326
                      : undefined
                  }
                  onPlay={() => {
                    if (
                      state.permissions &&
                      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                    ) {
                      if (!player.current.getInternalPlayer()) {
                        return;
                      }

                      if (!playing) {
                        player.current.getInternalPlayer().pause();
                      }
                      return;
                    }
                    sendControlsUpdate(true);
                  }}
                  onPause={() => {
                    if (
                      state.permissions &&
                      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                    ) {
                      if (!player.current.getInternalPlayer()) {
                        return;
                      }

                      if (playing) {
                        player.current.getInternalPlayer().play();
                      }
                      return;
                    }
                    sendControlsUpdate(false);
                  }}
                  onSeek={(seconds) => {
                    if (
                      state.permissions &&
                      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                    ) {
                      if (seconds !== seeked) {
                        player.current.seekTo(seeked, 'seconds');
                      }
                    }
                  }}
                  config={{
                    vimeo: {
                      playerOptions: { texttrack: 'cs' },
                    },
                  }}
                />
                <div className='controls'>
                  <IconButton
                    className='play'
                    onClick={() => {
                      sendControlsUpdate(!playing);
                    }}
                    iconProps={
                      playing ? { iconName: 'Pause' } : { iconName: 'Play' }
                    }
                    disabled={
                      state.permissions &&
                      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                    }
                  />
                  <Slider
                    className='slider'
                    max={100}
                    valueFormat={sliderValueFormat}
                    value={location}
                    onChange={onChangeValue}
                    showValue
                    disabled={
                      state.permissions &&
                      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                    }
                  />
                  <IconButton
                    className='fullscreen'
                    onClick={toggleFullScreen}
                    iconProps={{ iconName: 'FullScreen' }}
                  />
                </div>
                {state.permissions &&
                  state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU') && (
                    <div className='manage'>
                      <TextField
                        className='input'
                        value={urlValue}
                        onChange={(e, url) => setUrlValue(url || '')}
                        disabled={
                          state.permissions &&
                          !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                        }
                      />
                      <IconButton
                        onClick={() => {
                          setUrl(urlValue);
                          setPlaying(false);
                          setLocation(0);
                          setSeeked(0);
                        }}
                        iconProps={{ iconName: 'Forward' }}
                        disabled={
                          state.permissions &&
                          !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                        }
                      />
                    </div>
                  )}
              </div>
              <div className='chat'>
                <div className='playing'>
                  <div>
                    <img src={lock.projecting.moviePoster} className='poster' />
                  </div>
                  <div className='info'>
                    <p className='about'>Právě promítáme</p>
                    <h1 className='title'>{lock.projecting.movieName}</h1>
                    <p className='description'>{lock.projecting.movieData}</p>
                  </div>
                </div>
                <div className='area'>
                  <ul id='messages'>
                    {messages.map((message, i) => {
                      if (message.type == 'announcement') {
                        return (
                          <li key={i}>
                            <div class='announcement'>
                              <p>{message.text}</p>
                            </div>
                          </li>
                        );
                      } else {
                        return (
                          <li key={i}>
                            <div class='message'>
                              <Persona
                                className='profilePicture'
                                imageUrl={message.user.profilePicture}
                                size={PersonaSize.size32}
                                imageAlt='Persona'
                              />
                              <div className='messageBody'>
                                <div className='messageHeading'>
                                  <h1>{message.user.username}</h1>
                                  <p className='date'>
                                    {`${new Date(
                                      message.date
                                    ).getHours()}:${new Date(
                                      message.date
                                    ).getMinutes()}`}
                                  </p>
                                </div>
                                <p className='messageText'>{message.text}</p>
                              </div>
                            </div>
                          </li>
                        );
                      }
                    })}
                    <div ref={messagesEndRef}></div>
                  </ul>
                </div>
                <div className='messageInput'>
                  <TextField
                    className='input'
                    placeholder='Nová zprava'
                    value={textMessage}
                    onChange={(e, text) => setTextMessage(text || '')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendTextMessage(textMessage);
                        setTextMessage('');
                      }
                    }}
                    disabled={!state.username}
                  />
                  <IconButton
                    onClick={() => {
                      sendTextMessage(textMessage);
                      setTextMessage('');
                    }}
                    iconProps={{ iconName: 'Forward' }}
                    disabled={
                      state.permissions &&
                      !state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
                    }
                  />
                </div>
              </div>
            </div>
            <div className='watching'>
              <p className='about'>
                Diváci{' '}
                <span style={{ verticalAlign: 'top', fontSize: '10px' }}>
                  {watching.length}
                </span>
              </p>
              <Facepile
                maxDisplayablePersonas={99}
                overflowButtonType={{
                  key: OverflowButtonType.descriptive,
                  text: OverflowButtonType[OverflowButtonType.descriptive],
                }}
                personaSize={PersonaSize.size32}
                personas={watching}
              />
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div>
          <Title text='Přístup zakázán' />
          <div className='heading'>
            <h1>Pro vstup do virtuálního kinosálu se prosím přihlašte</h1>
          </div>
        </div>
      );
    }
  } else {
    return (
      <>
        <Title text='Virtuální kinosál' />
        <div className='heading'>
          <h1>Ve virtuálním kinosále se právě nepromíta</h1>
        </div>
        {lock && lock.closestProjection && (
          <div className='cinema' style={{ marginTop: 0 }}>
            <div className='playing' style={{ maxWidth: '360px' }}>
              <div>
                <img
                  src={lock.closestProjection.moviePoster}
                  className='poster'
                />
              </div>
              <div className='info'>
                <p className='about'>Příští projekce</p>
                <h1 className='title'>{lock.closestProjection.movieName}</h1>
                <p className='description'>
                  {lock.closestProjection.movieData}
                </p>
                <p className='start'>
                  {lock.closestProjection.type},{' '}
                  {new Date(lock.closestProjection.start).toLocaleString('cs')}
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};

export default VirtualniKinosal;
