const page = async () => {
  return (
    <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4 gap-8">
      <h2 className="text-4xl font-bold">
        <div>Tick information</div>
      </h2>
      <section className="space-y-3">
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
            <h3 className="font-bold">Southern Rodent Tick</h3>
            <span className="italic"> Ixodes Acuminatus</span>
            <ul className="list-disc list-inside">
              <li>Normally live in burrows of its hosts</li>
              <li>
                Typically found in southern England and parts of Europe,
                including areas such as the Channel Islands and Cornwall
              </li>
              <li>Hosts include small rodents, badgers and foxes</li>
            </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
          <h3 className="font-bold">Marsh Tick</h3>
          <span className="italic"> Ixodes Apronophorus</span>
          <ul className="list-disc list-inside">
            <li>Usually found in wetland areas, marshes and riverbanks</li>
            <li>Main hosts are water vole</li>
          </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
          <h3 className="font-bold">Tree-hole Tick</h3>
          <span className="italic">Ixodes Arboricola</span>
          <ul className="list-disc list-inside">
            <li>
              Hosts include Blue Tit, Great Tit, Barn owl and various other
              birds
            </li>
            <li>Mainly located in Southern England</li>
            <li>Lives in bird nests and tree holes</li>
          </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
          <h3 className="font-bold">Fox/Badger Tick</h3>
          <span className="italic">Ixodes Canisuga</span>
          <ul className="list-disc list-inside">
            <li>Found all throughout the UK</li>
            <li>Mostly found on badgers, foxes and dogs</li>
          </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
          <h3 className="font-bold">Passerine Tick</h3>
          <span className="italic">Ixodes Frontalis</span>
          <ul className="list-disc list-inside">
            <li>Hosts include pigeons, crows, doves and other birds</li>
            <li>Found in England and certain areas of Europe</li>
          </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
          <h3 className="font-bold">Hedgehog Tick</h3>
          <span className="italic">Ixodes Hexagonus</span>
          <ul className="list-disc list-inside">
            <li>
              Primarily found on Hedgehogs, but can also be found on horses and
              household pets such as dogs or cats
            </li>
            <li>Found throughout the UK and parts of Europe</li>
            <li>
              Is the most common tick found on cats, and second most common on
              dogs
            </li>
          </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
          <h3 className="font-bold">Sand Martin Tick</h3>
          <span className="italic">Ixodes Lividus</span>
          <ul className="list-disc list-inside">
            <li>Hosted mainly by sand and house martins</li>
            <li>Majority of sightings in England</li>
          </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
          <h3 className="font-bold">Sheep/Deer Tick</h3>
          <span className="italic">Ixodes Ricinus</span>
          <ul className="list-disc list-inside">
            <li>Most common species found in the UK</li>
            <li>Hosts include a wide variety of wild and domestic animals</li>
          </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
          <h3 className="font-bold">Puffin Tick</h3>
          <span className="italic">Ixodes Rothschildi</span>
          <ul className="list-disc list-inside">
            <li>Found predominantly in coastal areas of England and Wales</li>
            <li>Lives in the burrows of birds in these areas</li>
          </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
          <h3 className="font-bold">Cormorant Tick</h3>
          <span className="italic">Ixodes Unicavatus</span>
          <ul className="list-disc list-inside">
            <li>
              Hosts include a range of coastal/marine birds, including
              cormorants and shags
            </li>
            <li>Found in rocky areas of coastal England, France and Ireland</li>
          </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
          <h3 className="font-bold">Rabbit Tick</h3>
          <span className="italic">Ixodes Ventalloi</span>
          <ul className="list-disc list-inside">
            <li>Located on islands offshore</li>
            <li>
              Rabbits are the main hosts, but also infests several rabbit
              predators
            </li>
            <li>This species is rare in the UK</li>
          </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
          <h3 className="font-bold">Long-legged Bat Tick</h3>
          <span className="italic">Ixodes Vespertilionis</span>
          <ul className="list-disc list-inside">
            <li>Primarily uses bats as hosts</li>
            <li>Its long legs make it easy to distinguish</li>
            <li>Sighted across England, Scotland and Wales</li>
          </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
          <h3 className="font-bold">Seabird Tick</h3>
          <span className="italic">Ixodes Uriae</span>
          <ul className="list-disc list-inside">
            <li>Seabirds are the main hosts</li>
            <li>Extremely common from Cornwall to Shetland</li>
          </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
          <h3 className="font-bold">Shrew Tick</h3>
          <span className="italic">Ixodes Trianguliceps</span>
          <ul className="list-disc list-inside">
            <li>Found widely across the UK</li>
            <li>Parasitises the surface layers of small burrowing animals</li>
          </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
            <h3 className="font-bold">Northern Bird Tick</h3>
            <span className="italic">Ixodes Caledonicus</span>
            <ul className="list-disc list-inside">
              <li>Parasite soley of birds, especially those nested on cliffs</li>
              <li>Recorded sightings mainly in nothern Enland and Scotland</li>
            </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
            <h3 className="font-bold">Ornate Cow Tick</h3>
            <span className="italic">Dermacentor Reticulatus</span>
            <ul className="list-disc list-inside">
              <li>Mostly found in southwest England and Wales, and recently Essex</li>
              <li>Parasitises sheep, cattle and birds</li>
              <li>Ornate scutum allows it to be easily distinguished</li>
            </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
            <h3 className="font-bold">Red Sheep Tick</h3>
            <span className="italic">Haemaphysalis Punctata</span>
            <ul className="list-disc list-inside">
              <li>Mainly located in the south east of England, and sometimes in  south Wales</li>
              <li>Majority infest on sheep</li>
              <li>Occasionally parasitise passerine birds</li>
            </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
            <h3 className="font-bold">Marine Argasid</h3>
            <span className="italic">Carios Maritimus</span>
            <ul className="list-disc list-inside">
              <li>Infests seabirds</li>
              <li>Only ever recorded in offshore islands in the west of Wales</li>
            </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
          <div>
            <h3 className="font-bold">Pigeon Tick</h3>
            <span className="italic">Argas Reflexus</span>
            <ul className="list-disc list-inside">
              <li>Primarily infests domestic pigeons</li>
              <li>Mainly recorded in areas such as Cambridge and Canterbury Cathedral</li>
            </ul>
          </div>
        </article>
        <article className="bg-neutral-800 text-2x1 text-white grid grid-cols-2 gap-4 p-2">
          <div>
            <h3 className="font-bold">Blyborough Tick</h3>
            <span className="italic">Argas Vespertilionis</span>
            <ul className="list-disc list-inside">
              <li>Has a hemispherical shape</li>
              <li>Distributed on vespertilionis bats</li>
            </ul>
          </div>
          <div className="flex justify-center items-center">
          <img src="/ixodes-ricinus.jpg" alt="Sheep Tick" width={260} height={195}/>
          </div>
        </article>
      </section>
    </div>
  );
};

export default page;
