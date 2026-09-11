"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useRouter,
} from "next/navigation";

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

type BooleanFilter =
  | "all"
  | "yes"
  | "no";

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
  const router =
    useRouter();

  /*
   * ------------------------------------------------------------------------
   * INVITÉS
   * ------------------------------------------------------------------------
   */

  const [
    localGuests,
    setLocalGuests,
  ] =
    useState<Guest[]>(
      guests
    );

  /*
   * Si router.refresh() récupère
   * de nouvelles données depuis Neon,
   * on resynchronise la liste locale.
   */

  useEffect(() => {
    setLocalGuests(
      guests
    );
  }, [guests]);

  /*
   * ------------------------------------------------------------------------
   * FILTRES
   * ------------------------------------------------------------------------
   */

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    conciergeFilter,
    setConciergeFilter,
  ] =
    useState<BooleanFilter>(
      "all"
    );

  const [
    dietFilter,
    setDietFilter,
  ] =
    useState<BooleanFilter>(
      "all"
    );

  const [
    sort,
    setSort,
  ] =
    useState<SortOption>(
      "recent"
    );

  /*
   * ------------------------------------------------------------------------
   * SUPPRESSION
   * ------------------------------------------------------------------------
   */

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);

  /*
   * ------------------------------------------------------------------------
   * FILTRAGE + TRI
   * ------------------------------------------------------------------------
   */

  const filteredGuests =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const result =
        localGuests.filter(
          (guest) => {
            /*
             * Recherche
             */

            const searchableValues =
              [
                guest.nom,
                guest.prenom,
                guest.email,
                guest.telephone,
                guest.profession,
                guest.reseau_social ??
                  "",
              ];

            const matchesSearch =
              !normalizedSearch ||
              searchableValues.some(
                (value) =>
                  value
                    .toLowerCase()
                    .includes(
                      normalizedSearch
                    )
              );

            /*
             * Conciergerie
             */

            const matchesConcierge =
              conciergeFilter ===
                "all" ||
              (conciergeFilter ===
                "yes" &&
                guest.conciergerie) ||
              (conciergeFilter ===
                "no" &&
                !guest.conciergerie);

            /*
             * Régime alimentaire
             */

            const matchesDiet =
              dietFilter ===
                "all" ||
              (dietFilter ===
                "yes" &&
                guest.regime_alimentaire) ||
              (dietFilter ===
                "no" &&
                !guest.regime_alimentaire);

            return (
              matchesSearch &&
              matchesConcierge &&
              matchesDiet
            );
          }
        );

      /*
       * TRI
       */

      return [
        ...result,
      ].sort(
        (a, b) => {
          switch (sort) {
            case "old":
              return (
                new Date(
                  a.created_at
                ).getTime() -
                new Date(
                  b.created_at
                ).getTime()
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
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
              );
          }
        }
      );
    }, [
      localGuests,
      search,
      conciergeFilter,
      dietFilter,
      sort,
    ]);

  /*
   * ------------------------------------------------------------------------
   * STATISTIQUES
   * ------------------------------------------------------------------------
   */

  const conciergeCount =
    localGuests.filter(
      (guest) =>
        guest.conciergerie
    ).length;

  const dietCount =
    localGuests.filter(
      (guest) =>
        guest.regime_alimentaire
    ).length;

  /*
   * ------------------------------------------------------------------------
   * DÉCONNEXION
   * ------------------------------------------------------------------------
   */

  async function logout() {
    try {
      await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );
    } finally {
      router.push("/teonar-admin");

      router.refresh();
    }
  }

  /*
   * ------------------------------------------------------------------------
   * SUPPRESSION D'UN INVITÉ
   * ------------------------------------------------------------------------
   */

  async function deleteGuest(
    guest: Guest
  ) {
    /*
     * Confirmation navigateur.
     */

    const confirmed =
      window.confirm(
        `Supprimer définitivement ${guest.prenom} ${guest.nom} de la liste des invités ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        guest.id
      );

      /*
       * Requête DELETE.
       */

      const response =
        await fetch(
          `/api/admin/rsvp/${guest.id}`,
          {
            method:
              "DELETE",

            cache:
              "no-store",
          }
        );

      /*
       * On ne fait PAS :
       *
       * await response.json()
       *
       * directement.
       *
       * Si Next renvoie une page HTML ou
       * une réponse vide lors d'une erreur,
       * response.json() provoquerait :
       *
       * Unexpected end of JSON input
       */

      const responseText =
        await response.text();

      let data:
        | {
            success?: boolean;
            message?: string;
          }
        | null = null;

      if (responseText) {
        try {
          data =
            JSON.parse(
              responseText
            );
        } catch {
          /*
           * Réponse non JSON.
           *
           * On laisse data à null.
           */
          data = null;
        }
      }

      /*
       * Erreur API.
       */

      if (!response.ok) {
        throw new Error(
          data?.message ??
            `Erreur lors de la suppression (${response.status}).`
        );
      }

      /*
       * Suppression immédiate dans
       * l'interface.
       */

      setLocalGuests(
        (
          currentGuests
        ) =>
          currentGuests.filter(
            (
              currentGuest
            ) =>
              currentGuest.id !==
              guest.id
          )
      );

      /*
       * Mise à jour du Server Component.
       */

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE GUEST ERROR:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cet invité."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  /*
   * ------------------------------------------------------------------------
   * EXPORT CSV
   * ------------------------------------------------------------------------
   */

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

    function escapeCSV(
      value:
        | string
        | number
        | boolean
        | null
        | undefined
    ) {
      const text =
        value === null ||
        value ===
          undefined
          ? ""
          : String(
              value
            );

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;
    }

    /*
     * L'export respecte les filtres actifs.
     */

    const rows =
      filteredGuests.map(
        (guest) => [
          guest.prenom,

          guest.nom,

          guest.email,

          guest.telephone,

          guest.profession,

          guest.reseau_social ??
            "",

          guest.conciergerie
            ? "Oui"
            : "Non",

          guest.regime_alimentaire
            ? "Oui"
            : "Non",

          guest.regime_commentaire ??
            "",

          new Date(
            guest.created_at
          ).toLocaleString(
            "fr-FR"
          ),
        ]
      );

    const csv = [
      headers
        .map(
          escapeCSV
        )
        .join(";"),

      ...rows.map(
        (row) =>
          row
            .map(
              escapeCSV
            )
            .join(";")
      ),
    ].join("\n");

    /*
     * BOM UTF-8 pour éviter les problèmes
     * d'accents dans Excel.
     */

    const blob =
      new Blob(
        [
          "\uFEFF" +
            csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      "teonar-eventum-rsvp.csv";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }

  /*
   * ------------------------------------------------------------------------
   * UI
   * ------------------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#F1EEE7] text-[#171512]">
      {/* HEADER */}

      <header className="border-b border-black/10 px-6 py-7 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6">
          <div>
            <p className="font-rubik text-[8px] uppercase tracking-[0.45em] text-[#815B3E]">
              TEONAR EVENTUM
            </p>

            <h1 className="mt-2 font-display text-2xl font-light">
              Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* ACTUALISER */}

            <button
              type="button"
              onClick={() =>
                router.refresh()
              }
              className="
                border
                border-black/15
                px-5
                py-3
                font-rubik
                text-[8px]
                uppercase
                tracking-[0.25em]
                transition-colors
                hover:bg-black/5
              "
            >
              Actualiser
            </button>

            {/* DÉCONNEXION */}

            <button
              type="button"
              onClick={
                logout
              }
              className="
                bg-[#171512]
                px-5
                py-3
                font-rubik
                text-[8px]
                uppercase
                tracking-[0.25em]
                text-white
                transition-colors
                hover:bg-[#815B3E]
              "
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU */}

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

          {/* EXPORT */}

          <button
            type="button"
            onClick={
              exportCSV
            }
            className="
              w-fit
              border
              border-[#171512]
              px-6
              py-4
              font-rubik
              text-[8px]
              uppercase
              tracking-[0.3em]
              transition-colors

              hover:bg-[#171512]
              hover:text-[#F1EEE7]
            "
          >
            Exporter CSV
          </button>
        </div>

        {/* STATS */}

        <div className="mb-10 grid grid-cols-1 border border-black/10 sm:grid-cols-3">
          <Stat
            label="Invités"
            value={
              localGuests.length
            }
          />

          <Stat
            label="Conciergerie"
            value={
              conciergeCount
            }
          />

          <Stat
            label="Régimes particuliers"
            value={
              dietCount
            }
            last
          />
        </div>

        {/* FILTRES */}

        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
          {/* RECHERCHE */}

          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event
                  .target
                  .value
              )
            }
            placeholder="Rechercher un invité..."
            className="
              border
              border-black/15
              bg-transparent
              px-5
              py-4
              font-rubik
              text-sm
              outline-none
              placeholder:text-black/30
              focus:border-[#815B3E]
            "
          />

          {/* CONCIERGERIE */}

          <select
            value={
              conciergeFilter
            }
            onChange={(
              event
            ) =>
              setConciergeFilter(
                event
                  .target
                  .value as BooleanFilter
              )
            }
            className="
              border
              border-black/15
              bg-transparent
              px-5
              py-4
              font-rubik
              text-xs
              outline-none
            "
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

          {/* RÉGIME */}

          <select
            value={
              dietFilter
            }
            onChange={(
              event
            ) =>
              setDietFilter(
                event
                  .target
                  .value as BooleanFilter
              )
            }
            className="
              border
              border-black/15
              bg-transparent
              px-5
              py-4
              font-rubik
              text-xs
              outline-none
            "
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

          {/* TRI */}

          <select
            value={
              sort
            }
            onChange={(
              event
            ) =>
              setSort(
                event
                  .target
                  .value as SortOption
              )
            }
            className="
              border
              border-black/15
              bg-transparent
              px-5
              py-4
              font-rubik
              text-xs
              outline-none
            "
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
          {
            filteredGuests.length
          }{" "}
          résultat
          {filteredGuests.length >
          1
            ? "s"
            : ""}
        </p>

        {/* TABLE */}

        <div className="overflow-x-auto border border-black/10 bg-[#F7F4EE]">
          <table className="w-full min-w-[1500px] border-collapse text-left">
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

                <TableHeader>
                  Action
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {filteredGuests.map(
                (
                  guest
                ) => (
                  <tr
                    key={
                      guest.id
                    }
                    className="
                      border-b
                      border-black/[0.07]
                      align-top
                      transition-colors
                      last:border-0
                      hover:bg-black/[0.025]
                    "
                  >
                    {/* INVITÉ */}

                    <TableCell>
                      <p className="font-rubik text-sm font-medium">
                        {
                          guest.prenom
                        }{" "}
                        {
                          guest.nom
                        }
                      </p>
                    </TableCell>

                    {/* CONTACT */}

                    <TableCell>
                      <a
                        href={`mailto:${guest.email}`}
                        className="
                          block
                          font-rubik
                          text-xs
                          text-black/70
                          hover:text-[#815B3E]
                        "
                      >
                        {
                          guest.email
                        }
                      </a>

                      <a
                        href={`tel:${guest.telephone}`}
                        className="
                          mt-2
                          block
                          font-rubik
                          text-xs
                          text-black/40
                          hover:text-black
                        "
                      >
                        {
                          guest.telephone
                        }
                      </a>
                    </TableCell>

                    {/* PROFESSION */}

                    <TableCell>
                      {
                        guest.profession
                      }
                    </TableCell>

                    {/* RÉSEAU */}

                    <TableCell>
                      {guest.reseau_social ||
                        "—"}
                    </TableCell>

                    {/* CONCIERGERIE */}

                    <TableCell>
                      <StatusBadge
                        value={
                          guest.conciergerie
                        }
                      />
                    </TableCell>

                    {/* RÉGIME */}

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

                    {/* DATE */}

                    <TableCell>
                      {new Date(
                        guest.created_at
                      ).toLocaleDateString(
                        "fr-FR",
                        {
                          day:
                            "2-digit",

                          month:
                            "2-digit",

                          year:
                            "numeric",
                        }
                      )}

                      <p className="mt-1 text-[10px] text-black/35">
                        {new Date(
                          guest.created_at
                        ).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour:
                              "2-digit",

                            minute:
                              "2-digit",
                          }
                        )}
                      </p>
                    </TableCell>

                    {/* ACTION */}

                    <TableCell>
                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          guest.id
                        }
                        onClick={() =>
                          deleteGuest(
                            guest
                          )
                        }
                        className="
                          border
                          border-red-900/20
                          px-4
                          py-2.5
                          font-rubik
                          text-[8px]
                          uppercase
                          tracking-[0.2em]
                          text-red-800
                          transition-all
                          duration-300

                          hover:border-red-900
                          hover:bg-red-900
                          hover:text-white

                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        {deletingId ===
                        guest.id
                          ? "Suppression..."
                          : "Supprimer"}
                      </button>
                    </TableCell>
                  </tr>
                )
              )}

              {/* AUCUN RÉSULTAT */}

              {filteredGuests.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      8
                    }
                    className="
                      px-8
                      py-20
                      text-center
                      font-rubik
                      text-sm
                      text-black/40
                    "
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

/*
 * ==========================================================================
 * STAT
 * ==========================================================================
 */

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
          .padStart(
            2,
            "0"
          )}
      </p>
    </div>
  );
}

/*
 * ==========================================================================
 * TABLE HEADER
 * ==========================================================================
 */

function TableHeader({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <th
      className="
        whitespace-nowrap
        px-6
        py-5
        font-rubik
        text-[8px]
        font-normal
        uppercase
        tracking-[0.3em]
        text-black/40
      "
    >
      {children}
    </th>
  );
}

/*
 * ==========================================================================
 * TABLE CELL
 * ==========================================================================
 */

function TableCell({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <td
      className="
        px-6
        py-6
        font-rubik
        text-xs
        leading-5
        text-black/65
      "
    >
      {children}
    </td>
  );
}

/*
 * ==========================================================================
 * STATUS BADGE
 * ==========================================================================
 */

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
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${
            value
              ? "bg-[#A97A54]"
              : "bg-black/20"
          }
        `}
      />

      {value
        ? "Oui"
        : "Non"}
    </span>
  );
}