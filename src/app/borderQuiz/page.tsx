import React from "react";
import PocketBase, { RecordModel } from "pocketbase";
type Country = {
  collectionId: string;
  collectionName: string;
  country_border_code: string;
  country_border_name: string;
  country_code: string;
  country_name: string;
  created: string;
  id: string;
  updated: string;
};
type DataReturn = Country[] & RecordModel[];

async function getCountries() {
  const pb = new PocketBase("http://127.0.0.1:8090");

  //  fetch all records at once
  const records = await pb.collection("country_borders").getFullList({
    sort: "-created",
  });
  const countryNames = new Set(
    records.map((entry) => entry.country_name)
  ) as Set<string>;
  return [[...countryNames], records] as [any, DataReturn];
}
const getBorderingCountries = (name: string, data: Country[]): string[] => {
  const borderingCountries = data.filter((x) => x.country_border_name == name);
  return borderingCountries.map((x) => x.country_name);
};
const getAdditionalCountries = (
  borderingCountries: string[],
  data: Country[],
  country: string
): string[] => {
  const multipleChoiceRequirement = borderingCountries.length * 3;
  const additionalCountries: string[] = [];
  // Iterate over border countries to get list of their border countries
  const addNewCountries = (countryCode: string) => {
    const newCountryCodes = getBorderingCountries(countryCode, data);
    // filter out already included countries and the answer country
    const uniqueCountryCodes = newCountryCodes.filter(
      (x) => !additionalCountries.includes(x) && x != country
    );
    // push new couuntries to additionalCountries
    additionalCountries.push(...uniqueCountryCodes);
  };
  borderingCountries.forEach((borderCountry) => {
    addNewCountries(borderCountry);
  });
  if (additionalCountries.length >= multipleChoiceRequirement) {
    return additionalCountries;
  }
  // expand selection to have unique choices for MC
  additionalCountries.forEach((x) => {
    addNewCountries(x);
  });

  return additionalCountries;
};
const randomizeArray = (arr: any[]) => {
  const returnArr = arr.sort(func);

  function func() {
    return 0.5 - Math.random();
  }
  return returnArr;
};
const generateQuestionOrder = (
  borderingCountries: string[],
  additionalCountries: string[]
): string[][] => {
  let count = 0;
  const questions: string[][] = [];
  borderingCountries.forEach((answerCountry) => {
    const questionSet: string[] = [];
    const questionOrder = randomizeArray([0, 1, 2, 3]);
    questionOrder.forEach((x) => {
      if (x == 3) {
        questionSet.push(answerCountry);
      } else {
        if (x + count > additionalCountries.length - 1) {
          count = 0;
        }
        questionSet.push(additionalCountries[x + count++]);
      }
    });
    questions.push(questionSet);
  });
  return questions;
};
const generateQuestionData = (countryNames: string[], data: Country[]) => {
  const rndIdx = Math.floor(Math.random() * countryNames.length);
  const country = countryNames[rndIdx];
  const borderingCountries = getBorderingCountries(country, data);
  const additionalCountries = getAdditionalCountries(
    borderingCountries,
    data,
    country
  );

  return { country, borderingCountries, additionalCountries };
};

const page = async () => {
  const data = await getCountries();
  const { country, borderingCountries, additionalCountries } =
    await generateQuestionData(...data);
  const questionSet = await generateQuestionOrder(
    borderingCountries,
    additionalCountries
  );
  return (
    <div>
      <div>{JSON.stringify(country)}</div>
      <div>____</div>
      <div>{JSON.stringify(borderingCountries)}</div>
      <div>____</div>
      <div>{JSON.stringify(additionalCountries)}</div>
      <div>____</div>
      {questionSet.map((x, idx) => (
        <>
          <ul key={idx}>
            {x.map((q, k) => (
              <li key={k}>{q}</li>
            ))}
          </ul>
          <br />
        </>
      ))}
      {/* 
      <div>
        {JSON.stringify(additionalCountries.map((x) => x.country_name))}
      </div> */}
    </div>
  );
};

export default page;
