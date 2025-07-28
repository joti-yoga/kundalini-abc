import { useParams } from "react-router-dom";

export default function CoursePlayer() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="w-full max-w-screen-md p-4">
        <h2 className="text-xl font-bold mb-4">播放課程 ID: {id}</h2>
        <div className="aspect-w-16 aspect-h-9 bg-gray-900">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${id}`}
            title="YouTube Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}