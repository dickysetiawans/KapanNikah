export default function Breadcrumb({
  title,
  parent,
}) {
  return (
    <div className="mb-5">

      <h1 className="text-2xl font-bold">
        {title}
      </h1>

      <div className="text-gray-500 text-sm">

        Dashboard

        {parent && (
          <>
            {" / "}
            {parent}
          </>
        )}

        {" / "}
        {title}

      </div>

    </div>
  );
}