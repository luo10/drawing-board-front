import { useState } from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
`;

const Input = styled.input`
  width: 100%;
  max-width: 400px;
  height: 44px;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  -webkit-appearance: none;
  appearance: none;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const Button = styled.button`
  width: 100%;
  max-width: 400px;
  height: 44px;
  margin-top: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #ccc;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  font-size: 14px;
  text-align: center;
`;

function Login({ onLogin }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const studentId = formData.get('studentId');

    if (!name || !studentId) {
      setError('请填写完整信息');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://yassin-rj.xyz/drawing/api/auth/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "username": name, "student_id": studentId })
      });

      const data = await response.json();
      if (data.status_code !== 0) {
        throw new Error(data.message || '登录失败');
      }
      onLogin(data);
    } catch (err) {
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Form onSubmit={handleSubmit}>
        <Title>欢迎使用创意画板</Title>
        <Input
          type="text"
          name="name"
          placeholder="请输入姓名"
          required
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          enterKeyHint="next"
          disabled={isLoading}
        />
        <Input
          type="text"
          name="studentId"
          placeholder="请输入学号"
          required
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          enterKeyHint="done"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '登录中...' : '登录'}
        </Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </LoginContainer>
  );
}

export default Login;
