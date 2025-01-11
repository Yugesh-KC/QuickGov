export class EntityService {
  private entities: { name: string, url: string }[] = [
    { name: 'Ministry of Home Affairs', url: 'https://mohp.gov.np/' },
    { name: 'Ministry of Foreign Affairs', url: 'https://mofa.gov.np/' },
    { name: 'Ministry of Finance', url: 'https://mof.gov.np/' },
    { name: 'Ministry of Education, Science and Technology', url: 'http://www.moe.gov.np/' },
    { name: 'Ministry of Health and Population', url: 'https://mohp.gov.np/' },
    { name: 'Ministry of Law, Justice and Parliamentary Affairs', url: 'https://moljpa.gov.np/' },
    { name: 'Ministry of Labour, Employment and Social Security', url: 'http://www.mole.gov.np/' },
    { name: 'Ministry of Energy, Water Resources and Irrigation', url: 'https://www.moewri.gov.np/' },
    { name: 'Ministry of Agriculture and Livestock Development', url: 'http://www.moald.gov.np/' },
    { name: 'Ministry of Industry, Commerce and Supplies', url: 'http://www.moics.gov.np/' },
    { name: 'Ministry of Environment', url: 'https://www.moen.gov.np/' },
    { name: 'Ministry of Defense', url: 'https://www.mod.gov.np/' },
    { name: 'Ministry of Information and Communication', url: 'http://www.moic.gov.np/' },
    { name: 'Ministry of Youth and Sports', url: 'http://www.moys.gov.np/' },
    { name: 'Ministry of Urban Development', url: 'https://www.moud.gov.np/' },
    { name: 'Ministry of Women, Children and Senior Citizens', url: 'http://www.mowcsc.gov.np/' },
    { name: 'Ministry of Tourism, Culture and Civil Aviation', url: 'https://www.tourism.gov.np/' },
    { name: 'Ministry of Transport Management', url: 'https://www.motm.gov.np/' },
    { name: 'Ministry of Physical Infrastructure and Transport', url: 'http://www.mopit.gov.np/' },
    { name: 'Ministry of Science and Technology', url: 'http://www.most.gov.np/' }
  ];


  getEntity() {
    return this.entities;
  }
}