import { APICaller } from "../modules/api-caller";
import { CampaignBrief } from "./campaign-brief";
import { User } from "./user";
import { LabelResponse } from "./common/types";

export interface CampaignData {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isHidden: boolean;
  referenceId: string;
  budget: {
    currencyCode: string;
    budgetedAmount: string;
  } | null;
  labels: LabelResponse[];
  links: {
    self: string;
    brief: string;
    owner: string;
    parentCampaign: string;
    childCampaigns: [string];
  };
}

export interface Campaign extends CampaignData {}
export class Campaign {
  #apiCaller: APICaller;
  #tokenGetParam: any;

  constructor(data: CampaignData, apiCaller: APICaller, tokenGetParam?: any) {
    this.#apiCaller = apiCaller;
    this.#tokenGetParam = tokenGetParam;
    Object.assign(this, data);
  }

  async getBrief() {
    if (this.links.brief === null) return null;
    const campaignBriefData: any = await this.#apiCaller.get(
      this.links.brief,
      this.#tokenGetParam
    );
    const campaignBrief = new CampaignBrief(
      campaignBriefData,
      this.#apiCaller,
      this.#tokenGetParam
    );
    return campaignBrief;
  }

  async getOwner() {
    if (this.links.owner === null) return null;
    const ownerData: any = await this.#apiCaller.get(
      this.links.owner,
      this.#tokenGetParam
    );
    const owner = new User(ownerData);
    return owner;
  }

  async getChildCampaigns() {
    const childCampaigns = await Promise.all(
      this.links.childCampaigns.map(async (campUrl) => {
        const childCampaignData: any = await this.#apiCaller.get(
          campUrl,
          this.#tokenGetParam
        );
        const childCampaign = new Campaign(
          childCampaignData,
          this.#apiCaller,
          this.#tokenGetParam
        );
        return childCampaign;
      })
    );
    return childCampaigns;
  }

  async getParentCampaign() {
    if (this.links.parentCampaign === null) return null;
    const parentCampaignData = await (this.#apiCaller.get(
      this.links.parentCampaign,
      this.#tokenGetParam
    ) as Promise<CampaignData>);
    const parentCampaign = new Campaign(
      parentCampaignData,
      this.#apiCaller,
      this.#tokenGetParam
    );
    return parentCampaign;
  }
}
