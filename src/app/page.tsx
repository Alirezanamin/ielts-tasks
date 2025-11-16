import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-bold">Welcome to IELTS App</h1>
      <p className="m-5">Select student dashboard</p>
      <Link
        className="w-full border mt-10 p-2 rounded bg-blue-500 text-white"
        href="/student"
      >
        Go the dashboard
      </Link>
    </div>
  );
}
