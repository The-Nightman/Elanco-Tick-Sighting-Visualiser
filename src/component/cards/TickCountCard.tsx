import { TickCardData } from "@/app/interface/TickCardData";

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
    <div className="bg-sky-600 p-4 rounded shadow-md text-white max-w-sm">
      <p className="mb-2">
        <strong>Species:</strong> {data.species}
      </p>
      <p className="mb-2">
        <strong>Latin Name:</strong> {data.latinName}
      </p>
      <p className="mb-2">
        <strong>Count:</strong> {data.sightings}
      </p>
      <p>
        <strong>Last Reported:</strong> {formatter.format(data.lastReported)}
      </p>
    </div>
  );
};

export default TickCountCard;
