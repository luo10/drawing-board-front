import styled from "styled-components";
import { useState, useEffect } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const InstructionBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

const RedText = styled.span`
  color: red;
  font-weight: bold;
`;

const BoldText = styled.span`
  font-weight: bold;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  background-color: ${(props) => (props.disabled ? "#cccccc" : "#007bff")};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  display: block;
  margin: 0 auto;
  &:hover {
    background-color: ${(props) => (props.disabled ? "#cccccc" : "#0056b3")};
  }
`;

function Instructions({ onStart }) {
  const [countdown, setCountdown] = useState(10);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanStart(true);
    }
  }, [countdown]);

  return (
    <Container>
      <InstructionBox>
        <Title>实验须知</Title>
        <List>
          <li>本实验共包含6道绘画题目，每道题目限时5分钟。</li>
          <li>
            每道题目都会提供一个基础轮廓图，请在此基础上使用鼠标进行绘画创作。
          </li>
          <li>绘画过程中可以使用撤销（撤销上一笔）和恢复（恢复撤销）功能。</li>
          <li>
            每完成一幅画作后，请用尽可能简洁的中文词汇告诉我你画的是什么，然后提交。
          </li>
          <li>
            提交后会有5秒倒计时，期间不能继续绘画，倒计时结束后自动进入下一题。
          </li>
          <li>
            请认真对待每一幅作品，
            <RedText>
              尽量让每一幅作品画出的东西不一样，充分发挥你的创造力
            </RedText>
            。
          </li>
          <li>
            <BoldText>实验过程中请勿刷新页面或退出，否则数据会丢失</BoldText>。
          </li>
        </List>

        <Button onClick={onStart} disabled={!canStart}>
          {countdown > 0
            ? `请等待 ${countdown} 秒后开始实验`
            : "我已了解，开始实验"}
        </Button>
      </InstructionBox>
    </Container>
  );
}

export default Instructions;
