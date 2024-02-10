import React from "react";
import PocketBase, { RecordModel } from "pocketbase";
import MultipleChoiceQuestion from "../components/MultipleChoiceQuestion";
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
// Define a custom type DataReturn which is an array of Country objects and RecordModel objects
type DataReturn = Country[] & RecordModel[];

// Function to fetch countries data
async function getCountries() {
  // Instantiate PocketBase client with the URL
  const pb = new PocketBase("http://127.0.0.1:8090");

  // Fetch all records from the "country_borders" collection sorted by "created" field in descending order
  const records = await pb.collection("country_borders").getFullList({
    sort: "-created",
  });

  // Extract unique country names from the fetched records
  const countryNames = new Set(
    records.map((entry) => entry.country_name)
  ) as Set<string>;

  // Return an array containing unique country names and fetched records
  return [[...countryNames], records] as [any, DataReturn];
}

// Function to get bordering countries for a given country name
const getBorderingCountries = (name: string, data: Country[]): string[] => {
  const borderingCountries = data.filter((x) => x.country_border_name == name);
  return borderingCountries.map((x) => x.country_name);
};

// Function to get additional countries for multiple-choice questions
const getAdditionalCountries = (
  borderingCountries: string[],
  data: Country[],
  country: string
): string[] => {
  const multipleChoiceRequirement = borderingCountries.length * 3;
  const additionalCountries: string[] = [];

  // Iterate over bordering countries to get their bordering countries
  const addNewCountries = (countryCode: string) => {
    const newCountryCodes = getBorderingCountries(countryCode, data);

    // Filter out already included countries, other bordering countries, and the answer country
    const uniqueCountryCodes = newCountryCodes.filter(
      (x) =>
        !borderingCountries.includes(x) &&
        !additionalCountries.includes(x) &&
        x != country
    );

    // Add new countries to additionalCountries
    additionalCountries.push(...uniqueCountryCodes);
  };

  borderingCountries.forEach((borderCountry) => {
    addNewCountries(borderCountry);
  });

  // If additional countries meet the requirement, return them
  if (additionalCountries.length >= multipleChoiceRequirement) {
    return additionalCountries;
  }

  // Expand selection to have unique choices for multiple-choice questions
  additionalCountries.forEach((x) => {
    addNewCountries(x);
  });

  return additionalCountries;
};

// Function to randomize array elements
const randomizeArray = (arr: any[]) => {
  const returnArr = arr.sort(func);

  function func() {
    return 0.5 - Math.random();
  }
  return returnArr;
};

// Function to generate question order
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
        questionSet.push(additionalCountries[count++]);
      }
    });

    questions.push(questionSet);
  });

  return questions;
};

// Function to generate question data
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

// Asynchronous function to render the page
const page = async () => {
  const data = await getCountries();
  const { country, borderingCountries, additionalCountries } =
    await generateQuestionData(...data);
  const questionSet = await generateQuestionOrder(
    borderingCountries,
    additionalCountries
  );
  let idx = 0;
  // Return JSX to render the page
  return (
    <div>
      <div>{JSON.stringify(country)}</div>
      <div>____</div>
      <div>{JSON.stringify(borderingCountries)}</div>
      <div>____</div>
      <div>{JSON.stringify(additionalCountries)}</div>
      <div>____</div>
      <MultipleChoiceQuestion
        question={`Which Country borders ${country}`}
        options={questionSet[idx]}
        onSelect={() => {
          idx++;
        }}
      />
    </div>
  );
};

export default page;
