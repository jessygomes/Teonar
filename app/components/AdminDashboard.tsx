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

  const [
    localGuests,
    setLocalGuests,
  ] =
    useState<Guest[]>(
      guests
    );

  useEffect(() => {
    setLocalGuests(
      guests
    );
  }, [guests]);

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

            const matchesConcierge =
              conciergeFilter ===
                "all" ||
              (conciergeFilter ===
                "yes" &&
                guest.conciergerie) ||
              (conciergeFilter ===
                "no" &&
                !guest.conciergerie);

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
   * STATS
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
   * LOGOUT
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
      router.push(
        "/teonar-admin/login"
      );

      router.refresh();
    }
  }

  /*
   * ------------------------------------------------------------------------
   * DELETE
   * ------------------------------------------------------------------------
   */

  async function deleteGuest(
    guest: Guest
  ) {
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
          data = null;
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ??
            `Erreur lors de la suppression (${response.status}).`
        );
      }

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

  return (
    <main className="min-h-screen bg-[#F1EEE7] text-[#171512]">
      {/* HEADER */}

      <header className="border-b border-black/10 px-5 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-rubik text-[8px] uppercase tracking-[0.45em] text-[#815B3E]">
              TEONAR EVENTUM
            </p>

            <h1 className="mt-2 font-display text-2xl font-light">
              Administration
            </h1>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() =>
                router.refresh()
              }
              className="
                flex-1
                border
                border-black/15
                px-4
                py-3
                font-rubik
                text-[8px]
                uppercase
                tracking-[0.22em]
                transition-colors
                hover:bg-black/5
                sm:flex-none
              "
            >
              Actualiser
            </button>

            <button
              type="button"
              onClick={
                logout
              }
              className="
                flex-1
                bg-[#171512]
                px-4
                py-3
                font-rubik
                text-[8px]
                uppercase
                tracking-[0.22em]
                text-white
                transition-colors
                hover:bg-[#815B3E]
                sm:flex-none
              "
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-6 sm:py-10 lg:px-10">
        {/* TITRE */}

        <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-rubik text-[9px] uppercase tracking-[0.4em] text-[#815B3E]">
              Invitations
            </p>

            <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.025em] sm:text-4xl lg:text-5xl">
              Liste des invités
            </h2>
          </div>

          <button
            type="button"
            onClick={
              exportCSV
            }
            className="
              w-full
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

              sm:w-fit
            "
          >
            Exporter CSV
          </button>
        </div>

        {/* STATS */}

        <div className="mb-8 grid grid-cols-3 border border-black/10 sm:mb-10">
          <Stat
            label="Invités"
            mobileLabel="Invités"
            value={
              localGuests.length
            }
          />

          <Stat
            label="Conciergerie"
            mobileLabel="Concierg."
            value={
              conciergeCount
            }
          />

          <Stat
            label="Régimes particuliers"
            mobileLabel="Régimes"
            value={
              dietCount
            }
            last
          />
        </div>

        {/* FILTRES */}

        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
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
              min-w-0
              border
              border-black/15
              bg-transparent
              px-4
              py-3.5
              font-rubik
              text-sm
              outline-none
              placeholder:text-black/30
              focus:border-[#815B3E]
              sm:col-span-2
              lg:col-span-1
              lg:px-5
              lg:py-4
            "
          />

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
              min-w-0
              border
              border-black/15
              bg-[#F1EEE7]
              px-4
              py-3.5
              font-rubik
              text-xs
              outline-none
              lg:px-5
              lg:py-4
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
              min-w-0
              border
              border-black/15
              bg-[#F1EEE7]
              px-4
              py-3.5
              font-rubik
              text-xs
              outline-none
              lg:px-5
              lg:py-4
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
              min-w-0
              border
              border-black/15
              bg-[#F1EEE7]
              px-4
              py-3.5
              font-rubik
              text-xs
              outline-none
              sm:col-span-2
              lg:col-span-1
              lg:px-5
              lg:py-4
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

        {/* NOMBRE RÉSULTATS */}

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

        {/* ================================================================ */}
        {/* MOBILE                                                           */}
        {/* ================================================================ */}

        <div className="flex flex-col gap-4 md:hidden">
          {filteredGuests.map(
            (
              guest
            ) => (
              <article
                key={
                  guest.id
                }
                className="
                  border
                  border-black/10
                  bg-[#F7F4EE]
                "
              >
                {/* CARD HEADER */}

                <div className="flex items-start justify-between gap-4 border-b border-black/10 p-5">
                  <div className="min-w-0">
                    <p className="font-rubik text-base font-medium">
                      {
                        guest.prenom
                      }{" "}
                      {
                        guest.nom
                      }
                    </p>

                    <p className="mt-1 font-rubik text-[10px] uppercase tracking-[0.2em] text-black/35">
                      {formatDate(
                        guest.created_at
                      )}
                    </p>
                  </div>

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
                    aria-label={`Supprimer ${guest.prenom} ${guest.nom}`}
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      border
                      border-red-900/15
                      text-red-800
                      transition-colors
                      hover:bg-red-900
                      hover:text-white
                      disabled:opacity-40
                    "
                  >
                    {deletingId ===
                    guest.id ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current/30 border-t-current" />
                    ) : (
                      <TrashIcon />
                    )}
                  </button>
                </div>

                {/* INFORMATIONS */}

                <div className="p-5">
                  <MobileInfo
                    label="Email"
                  >
                    <a
                      href={`mailto:${guest.email}`}
                      className="break-all text-[#171512]"
                    >
                      {
                        guest.email
                      }
                    </a>
                  </MobileInfo>

                  <MobileInfo
                    label="Téléphone"
                  >
                    <a
                      href={`tel:${guest.telephone}`}
                      className="text-[#171512]"
                    >
                      {
                        guest.telephone
                      }
                    </a>
                  </MobileInfo>

                  <MobileInfo
                    label="Profession"
                  >
                    {
                      guest.profession
                    }
                  </MobileInfo>

                  <MobileInfo
                    label="Réseau"
                  >
                    {guest.reseau_social ||
                      "—"}
                  </MobileInfo>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="border border-black/10 p-4">
                      <p className="mb-3 font-rubik text-[8px] uppercase tracking-[0.22em] text-black/35">
                        Conciergerie
                      </p>

                      <StatusBadge
                        value={
                          guest.conciergerie
                        }
                      />
                    </div>

                    <div className="border border-black/10 p-4">
                      <p className="mb-3 font-rubik text-[8px] uppercase tracking-[0.22em] text-black/35">
                        Régime
                      </p>

                      <StatusBadge
                        value={
                          guest.regime_alimentaire
                        }
                      />
                    </div>
                  </div>

                  {guest.regime_alimentaire &&
                    guest.regime_commentaire && (
                      <div className="mt-3 border-l border-[#815B3E] pl-4">
                        <p className="font-rubik text-[8px] uppercase tracking-[0.2em] text-[#815B3E]">
                          Précisions
                        </p>

                        <p className="mt-2 font-rubik text-xs leading-5 text-black/60">
                          {
                            guest.regime_commentaire
                          }
                        </p>
                      </div>
                    )}
                </div>
              </article>
            )
          )}

          {filteredGuests.length ===
            0 && (
            <div className="border border-black/10 bg-[#F7F4EE] px-6 py-16 text-center">
              <p className="font-rubik text-sm text-black/40">
                Aucun invité ne
                correspond à ces
                critères.
              </p>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* TABLETTE / DESKTOP                                                */}
        {/* ================================================================ */}

        <div className="hidden overflow-x-auto border border-black/10 bg-[#F7F4EE] md:block">
          <table className="w-full min-w-[1450px] border-collapse text-left">
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

                    <TableCell>
                      {
                        guest.profession
                      }
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
                      {formatDate(
                        guest.created_at
                      )}

                      <p className="mt-1 text-[10px] text-black/35">
                        {formatTime(
                          guest.created_at
                        )}
                      </p>
                    </TableCell>

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
 * MOBILE INFO
 * ==========================================================================
 */

function MobileInfo({
  label,
  children,
}: {
  label: string;
  children:
    ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-black/[0.07] py-3.5 first:pt-0">
      <p className="shrink-0 font-rubik text-[8px] uppercase tracking-[0.2em] text-black/35">
        {label}
      </p>

      <div className="min-w-0 text-right font-rubik text-xs leading-5 text-black/65">
        {children}
      </div>
    </div>
  );
}

/*
 * ==========================================================================
 * STAT
 * ==========================================================================
 */

function Stat({
  label,
  mobileLabel,
  value,
  last = false,
}: {
  label: string;
  mobileLabel: string;
  value: number;
  last?: boolean;
}) {
  return (
    <div
      className={`
        min-w-0
        px-3
        py-5
        sm:p-7

        ${
          !last
            ? "border-r border-black/10"
            : ""
        }
      `}
    >
      <p className="truncate font-rubik text-[7px] uppercase tracking-[0.2em] text-black/40 sm:hidden">
        {
          mobileLabel
        }
      </p>

      <p className="hidden font-rubik text-[8px] uppercase tracking-[0.35em] text-black/40 sm:block">
        {label}
      </p>

      <p className="mt-2 font-display text-3xl font-light sm:mt-3 sm:text-4xl">
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

/*
 * ==========================================================================
 * TRASH ICON
 * ==========================================================================
 */

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-4 w-4"
    >
      <path
        d="M4 7h16"
        strokeLinecap="round"
      />

      <path
        d="M9 7V4h6v3"
        strokeLinecap="round"
      />

      <path
        d="M6.5 7l1 13h9l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 11v5M14 11v5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/*
 * ==========================================================================
 * DATE
 * ==========================================================================
 */

function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function formatTime(
  date: string
) {
  return new Date(
    date
  ).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}