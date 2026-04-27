import { TickCardData } from "@/interfaces/TickCardData";

interface TickCountCardProps {
  data: TickCardData;
}

const TickCountCard = ({ data }: TickCountCardProps) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <article className="bg-neutral-800 p-4 shadow-md text-white min-w-48">
      <dl className="flex flex-col gap-4">
        <div>
          <dt className="sr-only">Species</dt>
          <dd className="font-semibold">{data.species}</dd>
          <dt className="sr-only">Latin Name</dt>
          <dd className="text-neutral-300">{data.latinName}</dd>
        </div>
        <div>
          <dt className="font-semibold">Sightings</dt>
          <dd className="text-4xl font-bold">{data.sightings}</dd>
        </div>
        <div>
          <dt>Last Reported</dt>
          <dd>
            {data.lastReported !== null ? (
              <time dateTime={data.lastReported as string}>
                {formatter.format(new Date(data.lastReported))}
              </time>
            ) : (
              "Not reported"
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default TickCountCard;
