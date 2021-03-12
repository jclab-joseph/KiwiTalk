import { Menu, MenuItem } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import color from '../../../assets/colors/theme';
import bubbleTail from '../../../assets/images/bubble_tail.svg';
import bubbleTailMine from '../../../assets/images/bubble_tail_mine.svg';
import Strings from '../../../constants/Strings';
import KakaoManager from '../../../KakaoManager';
import { ReducerType } from '../../../reducers';
import { setReply } from '../../../reducers/chat';
import convertTime from '../../../utils/convertTime';

const BubbleTail = styled.img`
  margin-bottom: 5px;
  width: 16px;
  -webkit-user-drag: none;
`;

const FakeTail = styled.div`
  padding-left: 16px;
  height: 100%;
`;

const Wrapper = styled.div((props: { isMine: boolean }) => `
  display: flex;
  flex-direction: ${props.isMine ? 'row-reverse' : 'row'};
  align-items: flex-end;
  margin-top: 4px;
  justify-content: 'flex-start';
`);

const Content = styled.div((props: {
  isMine: boolean,
  hasPadding: boolean,
  hasAuthor: boolean
}) => `
  background: ${props.isMine ? color.BLUE_700 : color.GREY_900};
  ${props.hasPadding ? `padding: 8px 8px 8px 8px;` : ''}
  border-radius: 5px;
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  color: ${color.GREY_100};
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  
  transition: all 0.25s;
  
  max-width: 70%;
`);

const Author = styled.span((props: { hasPadding: boolean }) => `
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 17px;
  color: ${color.BLUE_300};
  padding: ${
  props.hasPadding ? '0' : '8'
}px ${
  props.hasPadding ? '0' : '8'
}px ${
  props.hasPadding ? '0' : '8'
}px ${
  props.hasPadding ? '0' : '8'
}px;
`);

const HeadWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Date = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  margin: 0px 8px;
  color: ${color.GREY_400};
`;

const Unread = styled.span((props: { isMine: boolean }) => `
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  margin: 0px 8px;
  text-align: ${props.isMine ? 'right' : 'left'};
  color: ${color.BLUE_400};
`);

interface Coordinate {
  x: number | null;
  y: number | null;
}

export interface BubbleProps {
  chatId: string;
  hasTail: boolean
  author?: string
  time: Date
  unread: number
  isMine: boolean
  hasPadding: boolean
}

const ChatBubble: React.FC<BubbleProps> = React.memo(({
  chatId,
  hasTail,
  author,
  time, unread,
  isMine,
  children,
  hasPadding,
}) => {
  const dispatch = useDispatch();

  const { select } = useSelector((state: ReducerType) => state.chat);

  const [hover, setHover] = useState(false);
  const [state, setState] = useState<Coordinate>({
    x: null,
    y: null,
  });

  const onClose = (type: 'reply' | 'copy' | 'delete' | null = null) => async () => {
    switch (type) {
      case 'reply':
        dispatch(setReply(chatId));
        break;
      case 'copy':
        break;
      case 'delete': {
        const chat = KakaoManager.chatList.get(select)?.find(({ LogId }) => LogId.equals(chatId));

        chat?.delete().then();
      }
        break;
    }

    setState({
      x: null,
      y: null,
    });
  };

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    setState({
      x: event.clientX - 2,
      y: event.clientY - 4,
    });
  };

  const hasAuthor = !!(!isMine && author);

  const menu = useMemo(() => (
    <Menu
      keepMounted
      open={state.y !== null}
      onClose={onClose()}
      anchorReference="anchorPosition"
      anchorPosition={
        (state.x !== null && state.y !== null) ?
          { top: state.y, left: state.x } :
          undefined
      }>
      <MenuItem onClick={onClose('reply')}>{Strings.Chat.REPLY}</MenuItem>
      <MenuItem onClick={onClose('delete')}>{Strings.Chat.DELETE}</MenuItem>
      <MenuItem onClick={onClose('copy')}>{Strings.Chat.COPY}</MenuItem>
    </Menu>
  ), [state]);

  return (
    <Wrapper
      isMine={isMine}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onContextMenu={onContextMenu}>
      {
        hasTail ?
          <BubbleTail src={isMine ? bubbleTailMine : bubbleTail}/> :
          <FakeTail/>
      }
      <Content
        isMine={isMine}
        hasAuthor={hasAuthor}
        hasPadding={hasPadding}>
        {
          hasAuthor ?
            <Author hasPadding={hasPadding}>{author}</Author> :
            hasPadding
        }
        {children}
      </Content>
      <HeadWrapper
        style={{
          opacity: hover ? 1 : 0,
        }}>
        <Unread isMine={isMine}>{unread}</Unread>
        <Date>{convertTime(time, false)}</Date>
      </HeadWrapper>
      {
        menu
      }
    </Wrapper>
  );
}, (prevProps, nextProps) => {
  if (prevProps.chatId !== nextProps.chatId) return false;
  if (prevProps.hasTail !== nextProps.hasTail) return false;
  if (prevProps.author !== nextProps.author) return false;
  if (prevProps.time.getTime() !== nextProps.time.getTime()) return false;
  if (prevProps.unread !== nextProps.unread) return false;
  if (prevProps.isMine !== nextProps.isMine) return false;
  return prevProps.hasPadding === nextProps.hasPadding;
});

export default ChatBubble;