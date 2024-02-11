import styles from "./BoardItem.module.css";
import { useEffect, useRef, useState } from "react";
import heart from "../../../assets/heart.png";
import icon from "../../../assets/profilecat.png";
import comment from "../../../assets/comments.png";
import saved from "../../../assets/saved.png";
import CommentModal from "../Comment/CommentModal";
import fullSave from "../../../assets/isSaved.png";
import fullHeart from "../../../assets/fullHeart.png";
import ZoomIn from "../../../assets/ZoomIn.png";
import etc from "../../../assets/dots.png";

import {
  postSaved,
  getIsSaved,
  postReaction,
  getMyReaction,
  getReactionCount,
  getArticle,
} from "./api";
import BoardImage from "./BoardImageModal";
import { useSelector } from "react-redux";
import EtcModal from "./EtcModal";

const BoardItem = ({ item, page, refreshList }) => {
  const [cModalOpen, setCModalOpen] = useState(false);
  const [etcModalOpen, setEtcModalOpen] = useState(false);
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const modalBackground = useRef();
  const etcModalBg = useRef();
  const [isLiked, setIsLiked] = useState(false);
  const [isMyLiked, setIsMyLiked] = useState(false);
  const [likeCnt, setLikeCnt] = useState(item.reactionCount);
  const [isSaved, setIsSaved] = useState(false);
  const [isMySaved, setIsMySaved] = useState(false);
  // backend에서 갖고온 오리지널 날짜(수정날짜 쓰기로 하였음)
  const originDate = item.modifiedAt;
  // Date 객체 생성
  const date = new Date(originDate);
  const adjustedDate = new Date(date.getTime());
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 오전/오후 표시를 위해 12시간제 사용
  };
  const formattedDate = new Intl.DateTimeFormat("ko-KR", options).format(
    adjustedDate
  );
  // 이미지 null로 등록할 경우 backend에서 랜덤 배경 이미지 던져줌 -> 경로 /background/ 없애서 렌더링
  // function fixedImagePath(item) {
  //   // background가 있는지 찾아서 있으면 없애서 return
  //   if (item.imageList[0].includes(`background`)) {
  //     return item.imageList[0].replace("/background/", "");
  //   }
  //   return item.content.imageList[0];
  // }

  // const imagePath = fixedImagePath(item);

  // board_main 너비 가져와서 width에 맞는 모달 띄우기
  const boardMainRef = useRef(null);
  const [boardMainWidth, setBoardMainWidth] = useState(0);
  // board_main 높이도 같이 prop으로 전달해야될듯
  const [boardMainHeight, setBoardMainHeight] = useState(0);

  useEffect(() => {
    if (boardMainRef.current) {
      setBoardMainWidth(boardMainRef.current.offsetWidth);
      setBoardMainHeight(boardMainRef.current.offsetHeight);
    }
  }, []);

  // 회원만 좋아요, 보관가능하게 하기 위한 토큰 필요
  const token = localStorage.getItem("access_token");
  const handleSaved = () => {
    if (token) {
      postSaved({ item, setIsSaved })
        .then((isSaved) => {
          // 요청 성공 후에 isMySaved 업데이트 해주기
          setIsMySaved(!isMySaved);
        })
        .catch((err) => {
          console.error("보관 요청 실패:", err);
        });
    } else {
      window.alert("로그인을 해주세요!");
    }
  };
  // prop으로 내려줄 articleId
  const articleId = item.id;
  // 닉네임 최적화
  const formattedName = item.nickname.split("(")[0];

  const handleLiked = () => {
    if (token) {
      postReaction({ item, setIsLiked, setLikeCnt })
        .then((isLiked) => {
          setIsMyLiked(!isMyLiked);
          // 좋아요 요청 처리한 후 최신 좋아요 개수 반영해서 reaction count 받아오기
        })
        .catch((err) => {
          console.error("좋아요 실패:", err);
        });
    } else {
      window.alert("로그인을 해주세요");
    }
  };

  const handleZoomIn = (event) => {
    event.stopPropagation(); // 이벤트 버블링 막기
    setImgModalOpen(true);
  };
  const closeImgModal = () => {
    setImgModalOpen(false); // 모달 닫기
  };

  const handleEtcModal = () => {
    setEtcModalOpen(true);
  };

  const handleCommentOpen = () => {
    setCModalOpen(true);
  };

  useEffect(() => {
    if (item && item.id) {
      getReactionCount({ item, setLikeCnt });
      getIsSaved({ item, setIsMySaved });
      getMyReaction({ item, setIsMyLiked });
    }
  }, [page, likeCnt]);

  return (
    <div className={styles.board_container}>
      <div
        ref={boardMainRef}
        className={`${styles.board_main} ${styles.board_imgTrue}`}
        style={{
          /* 이미지에 투명도 적용해서 자체 필터 씌워버리기 */

          background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${item.imageList[0]})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        {imgModalOpen ? (
          // 모달이 열려 있으면 모달 컴포넌트만 렌더링
          <BoardImage
            item={item}
            containerWidth={boardMainWidth}
            containerHeight={boardMainHeight}
            setImgModalOpen={setImgModalOpen}
            style={{ width: boardMainWidth, height: boardMainHeight }}
          />
        ) : (
          // 모달이 닫혀 있으면 페이지의 나머지 컨텐츠 렌더링
          <>
            <button onClick={handleZoomIn} className={styles.zoomBtn}>
              <img
                src={ZoomIn}
                alt="이미지 확대"
                style={{ width: "31px" }}
              ></img>
            </button>
            <div className={`${styles.board_content}`}>{item.content}</div>
          </>
        )}
      </div>

      <div className={styles.bottom}>
        <div className={styles.side_container}>
          <div>
            <button
              className={styles.savedBtn}
              onClick={handleSaved}
              style={{ visibility: cModalOpen ? "hidden" : "visible" }}
            >
              {isMySaved ? (
                <img
                  src={fullSave}
                  alt="보관완료"
                  style={{ width: "28px", height: "33px" }}
                ></img>
              ) : (
                <img
                  src={saved}
                  alt="보관함"
                  style={{ width: "28px", height: "33px" }}
                ></img>
              )}
            </button>
          </div>
          <div
            style={{
              marginBottom: "1rem",
              visibility: cModalOpen ? "hidden" : "visible",
            }}
          >
            <button className={styles.likedBtn} onClick={handleLiked}>
              {isMyLiked ? (
                <img
                  src={fullHeart}
                  alt="좋아요 누름"
                  style={{ width: "30px" }}
                />
              ) : (
                <img
                  src={heart}
                  alt="좋아요 안 누름"
                  style={{ width: "30px", height: "25.6px" }}
                ></img>
              )}
            </button>
            <div className={styles.count}>{likeCnt}</div>
          </div>
          <div className={`${styles.cmtModal}`}>
            {cModalOpen ? (
              <CommentModal
                setCModalOpen={setCModalOpen}
                articleId={articleId}
                item={item}
                style={{ width: boardMainWidth }}
              />
            ) : (
              <>
                <button
                  className={`${styles.commentBtn}`}
                  onClick={handleCommentOpen}
                >
                  <img src={comment} alt="댓글창" style={{ width: "30px" }} />
                </button>
                <div className={styles.count}>{item.commentCount}</div>
              </>
            )}
          </div>
          {cModalOpen && (
            <div
              className={styles.cmtModal}
              ref={modalBackground}
              onClick={(e) => {
                if (e.target === modalBackground.current) {
                  setCModalOpen(false);
                }
              }}
            />
          )}
          <div className={styles.cmtModal} style={{ marginTop: "1rem" }}>
            {etcModalOpen ? (
              // 모달이 열려 있으면 모달 컴포넌트만 렌더링
              <EtcModal
                item={item}
                setEtcModalOpen={setEtcModalOpen}
                refreshList={refreshList}
                style={{ width: boardMainWidth }}
                containerWidth={boardMainWidth}
              />
            ) : (
              // 모달이 닫혀 있으면 페이지의 나머지 컨텐츠 렌더링
              <>
                <button
                  className={styles.etcBtn}
                  alt="기타 등등"
                  onClick={handleEtcModal}
                >
                  <img
                    src={etc}
                    alt="기타 등등"
                    style={{ width: "30px", height: "30px" }}
                  ></img>
                </button>
              </>
            )}
          </div>
        </div>
        <div className={styles.item_profile}>
          <img src={icon} style={{ width: "4rem" }}></img>
          <div className={styles.profile_content}>
            {formattedName ? (
              <div>{formattedName}</div>
            ) : (
              <div>탈퇴한 회원</div>
            )}
            <div className={styles.createdAt}>{formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BoardItem;