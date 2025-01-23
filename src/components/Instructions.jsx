import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
`;

const InstructionBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 800px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const List = styled.ul`
  margin-bottom: 2rem;
  line-height: 1.6;
  
  li {
    margin-bottom: 1rem;
  }
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  &:hover {
    background-color: #0056b3;
  }
`;

function Instructions({ onStart }) {
  return (
    <Container>
      <InstructionBox>
        <Title>实验须知</Title>
        <List>
          <li>本实验共包含6道绘画题目，每道题目限时10分钟。</li>
          <li>每道题目都会提供一个简单的背景轮廓作为参考，请在此基础上进行创作。</li>
          <li>使用鼠标或触控笔进行绘画，画笔颜色为黑色。</li>
          <li>绘画过程中可以使用撤销和重做功能。</li>
          <li>完成一幅画作后，需要为作品命名（不超过8个字），然后提交。</li>
          <li>提交后会有5秒倒计时，期间不能继续绘画，倒计时结束后自动进入下一题。</li>
          <li>请认真对待每一幅作品，充分发挥你的创造力。</li>
          <li>实验过程中请勿刷新页面，否则数据可能会丢失。</li>
        </List>
        <Button onClick={onStart}>我已了解，开始实验</Button>
      </InstructionBox>
    </Container>
  );
}

export default Instructions;
