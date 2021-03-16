export class Utils {
    
    static shuffle(list: Array<Object>){
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = list[i];
            list[i] = list[j];
            list[j] = temp;
        }
    }

    static getRandomNumber(maxNum: number){
        // this will generate random number from 0 to maxNum - 1
        return Math.floor(Math.random() * maxNum);
      }
}
