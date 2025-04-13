import  axios from '@/api/axios'

export const xui = async () => {
    try {
      console.log('URAAAAAA');
      
      await axios.post('/catalog/item', {
        'SeriesName': 'The-wrong-way-to-use-healing-magic',
        'Description':"An ordinary walk home from school turns into an epic journey for Usato. After suddenly being dropped into another world with two fellow students, Usato learns he was summoned there by accident. But things turn around when he discovers a unique aptitude for healing magic! Now, he trains beyond human limitations, using his self-healing abilities to gain absurd strength and unrivaled stamina.",
        'SeriesViewName':'The wrong way to use healing magic',
        'Rate': 8.6,
        'Status': 'came out',
        'Type': 'series',
        'ReleaseYear': '2024',
        'Genre': ['Fantasy', 'Action','Epic','Adventure'],
        'Studio': ['Studio Add'],
        'AmountOfEpisode': 12,
        'VoiceActing': ['JumClub','AnimeVost','Anixar'],
        'VideoSource': 'The-wrong-way-to-use-healing-magic',
      });
      
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  
  export const xui2 = async () => {
    const result = await xui(); // Дождитесь завершения промиса
    if (result) {
      return true;
    } else {
      return false;
    }
  };
  