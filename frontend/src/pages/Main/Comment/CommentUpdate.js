// 수정 버튼 누르면
// 1. focus 시키기

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import style from "./CommentUpdate.module.css";
import { commentActions } from "../../../store/comment";

const CommentUpdate = ({ articleId }) => {
  const token = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  const dispatch = useDispatch();

  const commentId = useSelector((state) => state.comment.commentId);
  const content = useSelector((state) => state.comment.content);

  const [newComment, setNewComment] = useState(content);

  const content_change_handler = (e) => {
    console.log(e.target.value);
    setNewComment(e.target.value);
  };

  // 댓글 수정 취소
  const close_handler = () => {
    dispatch(commentActions.closeUpdate());
  };

  // axios : 댓글 수정
  const submit_handler = () => {
    console.log("articleId : ", articleId);
    console.log("commentId : ", commentId);
    console.log("newComment : ", newComment);
    console.log(token);
    console.log(refreshToken);
    axios
      .put(
        `/api/articles/${articleId}/comments/${commentId}`,
        {
          content: newComment,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
            refreshtoken: refreshToken,
          },
        }
      )
      .then((res) => {
        console.log("댓글 수정 성공 : ", res);
        alert("댓글이 수정되었습니다.");

        dispatch(commentActions.closeUpdate());
        dispatch(commentActions.handleRefresh());
      })
      .catch((err) => {
        console.log("댓글 수정 실패 : ", err);
      });
  };

  return (
    <div className={`${style.container}`}>
      <div className={`${style.comment}`}>
        <textarea
          value={newComment}
          onChange={content_change_handler}
          spellCheck="false"
        />
        <button className={`${style.bt_submit}`} onClick={submit_handler}>
          수정
        </button>
        <button className={`${style.bt_close}`} onClick={close_handler}>
          취소
        </button>
      </div>
    </div>
  );
};

export default CommentUpdate;
