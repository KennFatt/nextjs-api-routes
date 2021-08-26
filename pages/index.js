import { createRef } from "react";

export default function Home() {
  const emailInputRef = createRef(null);
  const messageInputRef = createRef(null);

  const onFormSubmit = (e) => {
    e.preventDefault();

    const email = emailInputRef.current?.value;
    const message = messageInputRef.current?.value;

    fetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ email, message }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(console.log)
      .catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="w-full max-w-xl min-h-full mx-auto">
        <h1 className="py-4 text-3xl font-semibold">Feedback Submission</h1>

        <hr className="border-gray-400" />

        <form onSubmit={onFormSubmit} className="py-4 space-y-2">
          <section>
            <label className="block" htmlFor="email">
              Email:
            </label>
            <input
              className="block w-full max-w-xs p-2 border border-gray-400"
              type="email"
              id="email"
              placeholder="jon@snow.com"
              ref={emailInputRef}></input>
          </section>

          <section>
            <label className="block" htmlFor="message">
              Message:
            </label>
            <textarea
              className="block w-full max-w-xs p-2 border border-gray-400"
              rows={5}
              id="message"
              ref={messageInputRef}></textarea>
          </section>

          <button className="px-4 py-2 text-white uppercase bg-gray-900">
            Submit
          </button>
        </form>
      </main>
    </div>
  );
}
