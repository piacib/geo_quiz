"use client";
import React, { FC } from "react";

interface Props {
  question: string;
  options: string[];
  onSelect: (selectedOption: string) => void;
}

const MultipleChoiceQuestion: FC<Props> = ({ question, options, onSelect }) => {
  return (
    <div>
      <h3>{question}</h3>
      <ul>
        {options.map((option, index) => (
          <li key={index}>
            <button onClick={() => onSelect(option)}>{option}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MultipleChoiceQuestion;
