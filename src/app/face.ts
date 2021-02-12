export class Face {
  public static TWO = new Face(2, "2");
  public static THREE = new Face(3, "3");
  public static FOUR = new Face(4, "4");
  public static FIVE = new Face(5, "5");
  public static SIX = new Face(6, "6");
  public static SEVEN = new Face(7, "7");
  public static EIGHT = new Face(8, "8");
  public static NINE = new Face(9, "9");
  public static TEN = new Face(10, "10");
  public static ONE_EYED_JACK = new Face(11, "👁 J");
  public static TWO_EYED_JACK = new Face(11, "👁👁 J");
  public static QUEEN = new Face(12, "Q");
  public static KING = new Face(13, "K");
  public static ACE = new Face(14, "A");

  rank: Number = 0;
  displayName: String = "";

  private constructor(rank: number, displayName: String){
    this.rank = rank;
    this.displayName = displayName;
  }
}
