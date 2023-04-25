import { useState } from "react";
import "./App.css";
import axios from "axios";
import { useEffect } from "react";
import Toast from "./Components/Toast";
import notificationSound from "./assets/toast_notification.wav";
function App() {
  const [input, setInput] = useState({
    data: "",
    inputLimit: 0,
    inputLimitExceeded: false,
  });
  const [resp, setResp] = useState("");
  const [loader, setLoader] = useState({
    loading: false,
    outcome: "",
  });
  const [copied, setCopied] = useState(false);
  const handleInputChange = (e) => {
    setInput((prev) => {
      return {
        ...prev,
        data: e.target.value,
      };
    });
  };
  let inputData = input.data;
  useEffect(() => {
    setInput((prev) => {
      return {
        ...prev,
        // inputLimit: input.data ? prev.data.split(" ").length : 0,
        inputLimit: prev.data
          .split(" ")
          .filter((elem) => elem.split("").length !== 0).length,
        inputLimitExceeded:
          prev.data.split(" ").filter((elem) => elem.split("").length !== 0)
            .length >= 2000
            ? true
            : false,
      };
    });
    console.log(
      input.data.split(" ").filter((elem) => elem.split("").length !== 0)
        .length,
      input.inputLimit
    );
  }, [input.data]);
  let data = JSON.stringify({
    providers: "emvista",
    text: `${inputData}`,
    response_as_dict: true,
    attributes_as_list: false,
    show_original_response: false,
    language: "en",
    output_sentences: 1,
  });
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.edenai.run/v2/text/summarize",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDI0NmFiZDctZjE4OC00MjgxLWIwMzQtODFkNTA2NTA2NjEwIiwidHlwZSI6ImFwaV90b2tlbiJ9.pXDQVXI9YKGl6pGDln54qRjOmMaXcgjruYZoWAatuGA",
    },
    data: data,
  };
  const summerizeFunc = () => {
    setResp("");
    setLoader((prev) => {
      return {
        ...prev,
        loading: true,
      };
    });
    setCopied(false);
    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data.emvista.result));
        let resultRespose = JSON.stringify(response.data.emvista.result);
        let cleanedResponse = resultRespose.replace(/^"(.*)"$/, "$1");
        setResp(cleanedResponse);
        setLoader((prev) => {
          return {
            ...prev,
            loading: false,
            outcome: "Successful!",
          };
        });
      })
      .catch((error) => {
        console.log(error);
        setLoader((prev) => {
          return {
            ...prev,
            loading: false,
            outcome:
              error.message ||
              error.response.data.error.message.text.join("") ||
              "Something went wrong!",
          };
        });
      });
  };
  let text = document.getElementById("output");
  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(text.innerText);
      console.log("Content copied to clipboard");
      setCopied(true);
      const timer = setTimeout(() => {
        setCopied(false);
      }, 5000);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  useEffect(() => {
    copyContent();
  }, []);
  return (
    <div className="App flex justify-center align-middle">
      <div className="container text-center p-2">
        <div className="lg:w-2/3 mx-auto">
          <h1 className="header">SumBit</h1>
          <h4 className="font-semibold w-fit mx-auto text-lg after:border after:w-4 hover:after:w-full after:transition-all cursor-default after:duration-300 after:border-transparent hover:after:border-neutral-500 after:flex after:align-middle after:justify-left text-neutral-700">
            A text summerizer app.
          </h4>
        </div>
        <div className="input my-4 mx-auto ">
          <div className="sm:col-span-2 ">
            <textarea
              type="text"
              name="name"
              value={input.data}
              onChange={handleInputChange}
              id="summaryInput"
              className="bg-gray-50 border w-full lg:w-4/6 mx-auto border-gray-300 text-gray-900 text-sm rounded-lg block  p-2.5 "
              placeholder="Type or paste article here"
              required=""
            />
            <div
              className={`textlimit justify-end flex lg:w-2/3 mx-auto ${
                input.inputLimit >= 2000 ? "text-red-500" : " text-neutral-400"
              }`}
            >
              {input.inputLimit} / 2000
            </div>
          </div>
        </div>
        <button
          onClick={summerizeFunc}
          disabled={
            input.data.length === 0 ||
            input.inputLimit >= 2000 ||
            loader.loading
          }
          className={`lg:w-1/3 w-full transition-colors duration-200 mb-4 lg:mb-10 bg-lime-200 ${
            loader.loading
              ? "bg-opacity-60 text-neutral-500 bg-lime-100"
              : " bg-opacity-100"
          } justify-center flex align-middle mx-auto disabled:bg-lime-100 text-neutral-800 disabled:cursor-not-allowed disabled:hover:border-neutral-200 disabled:text-neutral-300 hover:border-neutral-400`}
        >
          <h3 className="text-left w-fit text-lg font-semibold ">
            {loader.loading ? "Please wait..." : "Summerize"}
          </h3>
        </button>
        {resp && (
          <Toast
            message={loader.outcome}
            resp={resp}
            sound={notificationSound}
          />
        )}
        {copied && (
          <Toast
            message={"Copied"}
            resp={copied}
            // sound={notificationSound}
          />
        )}
        <div
          onClick={copyContent}
          id="output"
          style={{ minHeight: "250px", transition: "all ease-in-out 0.25s" }}
          className={`output border border-gray-300 ${
            resp && "hover:border-green-100 cursor-pointer hover:bg-lime-50 "
          } lg:w-2/3 mx-auto p-8`}
        >
          {/* {copied && <p>Copied</p>} */}
          <p
            id="summaryOutput"
            className="text   text-justify text-neutral-900"
          >
            {resp}
          </p>
        </div>
      </div>
    </div>
  );
}
export default App;
