import React from "react";
import PocketBase, { RecordModel } from "pocketbase";
type Country = {
  collectionId: String;
  collectionName: String;
  country_border_code: String;
  country_border_name: String;
  country_code: String;
  country_name: String;
  created: String;
  id: String;
  updated: String;
};
type DataReturn = Country[] & RecordModel[];
async function getCountries() {
  const pb = new PocketBase("http://127.0.0.1:8090");

  //  fetch all records at once
  const records = await pb.collection("country_borders").getFullList({
    sort: "-created",
  });
  const countryCodes = new Set(
    records.map((entry) => entry.country_code)
  ) as Set<string>;
  return [[...countryCodes], records] as [any, DataReturn];
}

const page = async () => {
  const data = await getCountries();
  return (
    <div>
      <div>{JSON.stringify(data[0])}</div>
    </div>
  );
};

export default page;
