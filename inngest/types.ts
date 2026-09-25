// Dito tinutukoy ang eksaktong hugis ng data ng iyong Judge engine
export type InngestEvents = {
  "app/data.submitted": {
    data: {
      action: "MERGE" | "SPLIT" | "SWITCH";
      items: Array<{ id: string; val: number }>;
    };
  };
};
