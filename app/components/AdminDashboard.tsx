"use client";

import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Guest = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession: string;
  reseau_social: string | null;
  conciergerie: boolean;
  regime_alimentaire: boolean;
  regime_commentaire: string | null;
  created_at: string;
};

type BooleanFilter = "all" | "yes" | "no";

type SortOption =
  | "recent"
  | "old"
  | "name-asc"
  | "name-desc";

export default function AdminDashboard({
  guests,
}: {
  guests: Guest[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [conciergeFilter, setConciergeFilter] =
    useState<BooleanFilter>("all");

  const [dietFilter, setDietFilter] =
    useState<BooleanFilter>("all");

  const [sort, setSort] =
    useState<SortOption>("recent");

  const filteredGuests = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    const result = guests.filter((guest) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          guest.nom,
          guest.prenom,
          guest.email,
          guest.telephone,
          guest.profession,
          guest.reseau_social ?? "",
        ].some((value) =>
          value
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesConcierge =
        conciergeFilter === "all" ||
        (conciergeFilter === "yes" &&
          guest.conciergerie) ||
        (conciergeFilter === "no" &&
          !guest.conciergerie);

      const matchesDiet =
        dietFilter === "all" ||
        (dietFilter === "yes" &&
          guest.regime_alimentaire) ||
        (dietFilter === "no" &&
          !guest.regime_alimentaire);

      return (
        matchesSearch &&
        matchesConcierge &&
        matchesDiet
      );
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "old":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "name-asc":
          return a.nom.localeCompare(
            b.nom,
            "fr"
          );

        case "name-desc":
          return b.nom.localeCompare(
            a.nom,
            "fr"
          );

        case "recent":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });
  }, [
    guests,
    search,
    conciergeFilter,
    dietFilter,
    sort,
  ]);

  const conciergeCount = guests.filter(
    (guest) => guest.conciergerie
  ).length;

  const dietCount = guests.filter(
    (guest) => guest.regime_alimentaire
  ).length;

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/teonar-admin/login");
    router.refresh();
  }

  function exportCSV() {
    const headers = [
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Profession",
      "Réseau social",
      "Conciergerie",
      "Régime alimentaire",
      "Détails régime",
      "Inscription",
    ];

    const escapeCSV = (
      value: string | number | boolean | null
    ) => {
      const text =
        value === null ||
        value === undefined
          ? ""
          : String(value);

      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = filteredGuests.map(
      (guest) => [
        guest.prenom,
        guest.nom,
        guest.email,
        guest.telephone,
        guest.profession,
        guest.reseau_social ?? "",
        guest.conciergerie ? "Oui" : "Non",
        guest.regime_alimentaire
          ? "Oui"
          : "Non",
        guest.regime_commentaire ?? "",
        new Date(
          guest.created_at
        ).toLocaleString("fr-FR"),
      ]
    );

    const csv = [
      headers
        .map(escapeCSV)
        .join(";"),
      ...rows.map((row) =>
        row.map(escapeCSV).join(";")
      ),
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "teonar-eventum-rsvp.csv";

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#F1EEE7] text-[#171512]">
      {/* HEADER */}

      <header className="border-b border-black/10 px-6 py-7 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div>
            <p className="font-rubik text-[8px] uppercase tracking-[0.45em] text-[#815B3E]">
              TEONAR EVENTUM
            </p>

            <h1 className="mt-2 font-display text-2xl font-light">
              Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                router.refresh()
              }
              className="border border-black/15 px-5 py-3 font-rubik text-[8px] uppercase tracking-[0.25em] transition-colors hover:bg-black/5"
            >
              Actualiser
            </button>

            <button
              onClick={logout}
              className="bg-[#171512] px-5 py-3 font-rubik text-[8px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#815B3E]"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-10">
        {/* TITRE */}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-rubik text-[9px] uppercase tracking-[0.4em] text-[#815B3E]">
              Invitations
            </p>

            <h2 className="mt-3 font-display text-4xl font-light tracking-[-0.025em] lg:text-5xl">
              Liste des invités
            </h2>
          </div>

          <button
            onClick={exportCSV}
            className="w-fit border border-[#171512] px-6 py-4 font-rubik text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-[#171512] hover:text-[#F1EEE7]"
          >
            Exporter CSV
          </button>
        </div>

        {/* STATS */}

        <div className="mb-10 grid grid-cols-1 border border-black/10 sm:grid-cols-3">
          <Stat
            label="Invités"
            value={guests.length}
          />

          <Stat
            label="Conciergerie"
            value={conciergeCount}
          />

          <Stat
            label="Régimes particuliers"
            value={dietCount}
            last
          />
        </div>

        {/* FILTERS */}

        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Rechercher un invité..."
            className="border border-black/15 bg-transparent px-5 py-4 font-rubik text-sm outline-none placeholder:text-black/30 focus:border-[#815B3E]"
          />

          <select
            value={conciergeFilter}
            onChange={(event) =>
              setConciergeFilter(
                event.target
                  .value as BooleanFilter
              )
            }
            className="border border-black/15 bg-transparent px-5 py-4 font-rubik text-xs outline-none"
          >
            <option value="all">
              Conciergerie · Tous
            </option>

            <option value="yes">
              Conciergerie · Oui
            </option>

            <option value="no">
              Conciergerie · Non
            </option>
          </select>

          <select
            value={dietFilter}
            onChange={(event) =>
              setDietFilter(
                event.target
                  .value as BooleanFilter
              )
            }
            className="border border-black/15 bg-transparent px-5 py-4 font-rubik text-xs outline-none"
          >
            <option value="all">
              Régime · Tous
            </option>

            <option value="yes">
              Régime · Oui
            </option>

            <option value="no">
              Régime · Non
            </option>
          </select>

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target
                  .value as SortOption
              )
            }
            className="border border-black/15 bg-transparent px-5 py-4 font-rubik text-xs outline-none"
          >
            <option value="recent">
              Plus récents
            </option>

            <option value="old">
              Plus anciens
            </option>

            <option value="name-asc">
              Nom A → Z
            </option>

            <option value="name-desc">
              Nom Z → A
            </option>
          </select>
        </div>

        {/* NOMBRE DE RÉSULTATS */}

        <p className="mb-4 font-rubik text-[9px] uppercase tracking-[0.3em] text-black/40">
          {filteredGuests.length} résultat
          {filteredGuests.length > 1
            ? "s"
            : ""}
        </p>

        {/* TABLE */}

        <div className="overflow-x-auto border border-black/10 bg-[#F7F4EE]">
          <table className="w-full min-w-[1400px] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/10">
                <TableHeader>
                  Invité
                </TableHeader>

                <TableHeader>
                  Contact
                </TableHeader>

                <TableHeader>
                  Profession
                </TableHeader>

                <TableHeader>
                  Réseau
                </TableHeader>

                <TableHeader>
                  Conciergerie
                </TableHeader>

                <TableHeader>
                  Régime
                </TableHeader>

                <TableHeader>
                  Inscription
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {filteredGuests.map(
                (guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-black/[0.07] align-top transition-colors last:border-0 hover:bg-black/[0.025]"
                  >
                    <TableCell>
                      <p className="font-rubik text-sm font-medium">
                        {guest.prenom}{" "}
                        {guest.nom}
                      </p>
                    </TableCell>

                    <TableCell>
                      <a
                        href={`mailto:${guest.email}`}
                        className="block font-rubik text-xs text-black/70 hover:text-[#815B3E]"
                      >
                        {guest.email}
                      </a>

                      <a
                        href={`tel:${guest.telephone}`}
                        className="mt-2 block font-rubik text-xs text-black/40 hover:text-black"
                      >
                        {guest.telephone}
                      </a>
                    </TableCell>

                    <TableCell>
                      {guest.profession}
                    </TableCell>

                    <TableCell>
                      {guest.reseau_social ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        value={
                          guest.conciergerie
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        value={
                          guest.regime_alimentaire
                        }
                      />

                      {guest.regime_alimentaire &&
                        guest.regime_commentaire && (
                          <p className="mt-3 max-w-[240px] font-rubik text-xs leading-5 text-black/50">
                            {
                              guest.regime_commentaire
                            }
                          </p>
                        )}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        guest.created_at
                      ).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}

                      <p className="mt-1 text-[10px] text-black/35">
                        {new Date(
                          guest.created_at
                        ).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </TableCell>
                  </tr>
                )
              )}

              {filteredGuests.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-20 text-center font-rubik text-sm text-black/40"
                  >
                    Aucun invité ne
                    correspond à ces
                    critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  last = false,
}: {
  label: string;
  value: number;
  last?: boolean;
}) {
  return (
    <div
      className={`p-7 ${
        !last
          ? "border-b border-black/10 sm:border-b-0 sm:border-r"
          : ""
      }`}
    >
      <p className="font-rubik text-[8px] uppercase tracking-[0.35em] text-black/40">
        {label}
      </p>

      <p className="mt-3 font-display text-4xl font-light">
        {value
          .toString()
          .padStart(2, "0")}
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-6 py-5 font-rubik text-[8px] font-normal uppercase tracking-[0.3em] text-black/40">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-6 py-6 font-rubik text-xs leading-5 text-black/65">
      {children}
    </td>
  );
}

function StatusBadge({
  value,
}: {
  value: boolean;
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        whitespace-nowrap
        px-3
        py-2
        font-rubik
        text-[8px]
        uppercase
        tracking-[0.2em]
        ${
          value
            ? "bg-[#171512] text-[#F1EEE7]"
            : "border border-black/10 text-black/35"
        }
      `}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          value
            ? "bg-[#A97A54]"
            : "bg-black/20"
        }`}
      />

      {value ? "Oui" : "Non"}
    </span>
  );
}