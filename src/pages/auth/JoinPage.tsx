import { Link } from 'react-router-dom';

function JoinPage() {
  return (
    <>
      <div>
        <Link to="/">main</Link>
        <h2>회원가입 페이지</h2>
        <Link to="/login">로그인</Link>
      </div>
    </>
  );
}

export default JoinPage;
