// 분당 프레임 수 ex) 60 ==> 1초당 프레임 1
const framePerMin = 6;

//작물들 정보
const cropInform = {
  cabbage: {
    name: "cabbage",
    price: {
      sell: 2000,
      purchase: 1000,
    },
    growthTime: 10, //minute
    condition: {
      perMin: {
        moisture: 5,
        nutrition: 5,
      },
    },
    comment: "this is cabbage.",
  },
  carrot: {
    name: "cabbage",
    price: {
      sell: 3000,
      purchase: 1500,
    },
    growthTime: 10, //minute
    condition: {
      perMin: {
        moisture: 10,
        nutrition: 10,
      },
    },
    comment: "this is carrot.",
  },
};

//각 타일 정보
let howManyChoose = 0;

class Tile {
  constructor({ x, y }) {
    this.informHtml = "";
    //위치
    this.position = {
      x: x,
      y: y,
    };
    this.crop = undefined;
    this.capacity = {
      moisture: 500,
      nutrition: 500,
    };
    this.howManyChoose;
    //보유하고있는 수분, 영양
    this.condition = {
      moisture: 150,
      nutrition: 125,
    };
    this.html;
    //현재 땅위에 뭐가 있는지
    this.currentRole = "blank"; //blank, construtor, field
  }
  //보유량 변화
  addCon(type, addition) {
    this.condition[type] += addition;
  }

  draw() {
    this.informHtml.innerHTML = `mois: ${this.condition.moisture} / nut: ${this.condition.nutrition}`;
  }

  //보유량 변화사킬 수 있는지
  isOk(type, amount) {
    if (this.condition[type] < amount) {
      this.alert(type);
      return false;
    }
    return true;
  }
  //땅위에 바꾸기
  changeRole(role) {
    this.currentRole = role;
  }
  showChooseTile(type, func) {
    switch (type) {
      case "seed":
        if (this.crop) {
          return;
        }
        break;
    }
    const btn = document.createElement("button");
    btn.classList = "cancel-btn";
    btn.innerHTML = "cancel";
    btn.addEventListener("click", () =>
      this.cancelChoose()
    );
    const chooseTileHtml = document.createElement("div");
    chooseTileHtml.classList = "choose-tile";
    chooseTileHtml.addEventListener("click", () => {
      func(this);
    });
    !ground.querySelector(".cancel-btn") &&
      ground.append(btn);
    this.html.append(chooseTileHtml);
  }
  cancelChoose() {
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].hideChooseTile();
    }

    const cancelBtn = ground.querySelector(".cancel-btn");

    cancelBtn && cancelBtn.remove();
    howManyChoose = 0;
  }
  hideChooseTile() {
    const chooseTileHtml =
      this.html.querySelector(".choose-tile");
    chooseTileHtml && chooseTileHtml.remove();
  }
  //보유량이 부족할경우 알림
  alert(content) {
    switch (content) {
      case "moisture":
        console.log("moisture warnning!!!");
        break;
      case "nutrition":
        console.log("nutrition warnning!!!");
        break;
    }
  }
}

//crop
class Crop {
  constructor({ setting, tile }) {
    this.name = setting.name;
    //작물 설정
    this.inform = { ...setting };
    this.isFullSize = false; // 다 자랐는지
    this.currentTIme = 0; // 얼마동안 자라고 있는지

    this.where = tile; // 어디 땅 위에서 자라고 있는지

    this.isGrowing = false; // 자라고 있는 중인지

    this.isComplete = {
      //이미  썼는지
      moisture: false,
      nutrition: false,
    };

    this.frame = 0;
  }

  // 영양, 수분 소비
  subCon(type, sub) {
    if (this.isComplete[type]) return;
    sub = sub || this.inform.condition.perMin[type]; //지정된 양이 없으면 분당 소비량으로

    if (this.where.isOk(type, sub)) {
      //보유량 괜찮은지 확인
      this.isComplete[type] = true;
      this.where.addCon(type, sub * -1);
    } else {
      this.isComplete[type] = false;
      return;
    }
  }

  interval() {
    if (this.isFullSize) {
      //다 자랐는지 확인
      console.log("it's full!!!");
      return;
    }

    const arr = Object.keys(this.isComplete);

    if (this.frame % framePerMin === 0) {
      // 1분이 지났다면
      const perMinUseArr = Object.keys(
        this.inform.condition.perMin
      );
      for (let i = 0; i < perMinUseArr.length; i++) {
        this.subCon(perMinUseArr[i]);
      }

      for (let i = 0; i < arr.length; i++) {
        if (!this.isComplete[arr[i]]) {
          this.isGrowing = false;
          return;
        }
      }
      this.currentTIme++;
      for (let i = 0; i < arr.length; i++) {
        this.isComplete[arr[i]] = false;
      }

      if (this.inform.growthTime <= this.currentTIme) {
        this.isFullSize = true;
      }
    }
    for (let i = 0; arr.length; i++) {
      if (!this.isComplete[arr[i]]) {
        this.isGrowing = false;
        return;
      }
    }
    this.frame++;
    this.isGrowing = true;
  }
}

//html
const ground = document.querySelector(".ground");

const length = 4; // 타일 개수(임시)
const tiles = [];

let choosedTile;

//tile init
(function init(length, tiles, ground) {
  //length 만큼 타일 생성
  for (let i = 0; i < length; i++) {
    tiles[i] = new Tile({ x: i, y: 0 });
  }

  // 타일을 html에 그리기
  for (let i = 0; i < tiles.length; i++) {
    const tileHtml = document.createElement("div");
    tileHtml.classList.add("tile");
    tileHtml.innerHTML = `
        <div class="inform">mois: 0 / nut: 0</div>
        <div class="buttons">
          <button class="plant">plant</button>
          <button class="watering">water</button>
          <button class="havest">havest</button>
        </div>
    `;
    const informHtml = tileHtml.querySelector(".inform");
    const plantHtml = tileHtml.querySelector(".plant");
    const wateringHtml =
      tileHtml.querySelector(".watering");
    const havestHtml = tileHtml.querySelector(".havest");

    //각 버튼 기능들 심기, 물주기, 추수
    plantHtml.addEventListener("click", () =>
      plant(tiles[i])
    );
    wateringHtml.addEventListener("click", () =>
      watering(tiles[i])
    );
    havestHtml.addEventListener("click", () =>
      havest(tiles[i])
    );
    ground.append(tileHtml);
    tiles[i].informHtml = informHtml;
    tiles[i].html = tileHtml;
  }
})(length, tiles, ground);

// 프레임마다 작동시키기
setInterval(() => {
  // 타일을 그리고 작물들의 인터벌 작동
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].draw();
    tiles[i].crop && tiles[i].crop.interval();
  }
}, (framePerMin / 60.0) * 1000);

//추수
function havest(tile) {
  //타일에 작물이 존재하고 작물이 다 자랐다면
  if (!tile.crop || !tile.crop.isFullSize) {
    console.log("still small, man!");
    return;
  }
  console.log(tile.crop);
  inventory.addItem({
    name: tile.crop.name,
    type: "crop",
    inform: tile.crop.inform,
    cnt: 1,
  });
  tile.crop = undefined;
}

//작물 고르기
function chooseCrop() {}

//물주기
function watering(tile) {
  tile.addCon("nutrition", 5);
  tile.addCon("moisture", 5);
}

/*



item  / inventory


*/
//item
class Item {
  constructor({ name, type, inform, cnt }) {
    this.type = type;
    this.name = name;
    this.inform = inform;
    this.cnt = cnt || 1;
  }
  returnFunc(type, useType = "full") {
    let toReturn;
    switch (type) {
      case "seed":
        this.useSeed();
        break;
      case "item":
        this.useItem(useType);
        break;
    }
  }
  useSeed() {
    let howMany = Number(prompt("how many"));

    //
    for (;;) {
      if (
        Number.isNaN(howMany) ||
        howMany > this.cnt ||
        howMany <= 0
      ) {
        howMany = Number(prompt("how many"));
        continue;
      }
      break;
    }
    howManyChoose = howMany;
    const func = (tile) => {
      const cropName = this.name.split("_")[0];
      //타일에 작물이 이미 존재하다면
      if (tile.crop) {
        console.log("still excist!");
        return;
      }
      //작물을 선택하지 않았다면
      if (this.type != "seed") {
        console.log("choose type!!");
        return;
      }
      const crop = new Crop({
        setting: cropInform[cropName],
        tile: tile,
      });
      tile.crop = crop;

      inventory.subItem(inventory.choosedItem);
      tile.hideChooseTile();
      if (--howManyChoose <= 0) tiles[0].cancelChoose();
    };

    for (let i = 0; i < tiles.length; i++) {
      tiles[i].showChooseTile(this.type, func);
    }
    console.log(this);
  }
  useItem(useType) {
    let howMany = this.cnt;

    howManyChoose = howMany;

    const type = this.inform.work.type;
    const func = (tile) => {
      let howManyUseSameTime = 1;
      if (useType == "full") {
        let num =
          tile.capacity[type] - tile.condition[type];
        num = Math.ceil(num / this.inform.work.amount);
        if (num > this.cnt) {
          howManyUseSameTime = this.cnt;
        } else {
          howManyUseSameTime = num;
        }
      }
      for (let i = 0; i < howManyUseSameTime; i++) {
        tile.addCon(
          this.inform.work.type,
          this.inform.work.amount
        );
        inventory.subItem(inventory.choosedItem);
        howManyChoose--;
      }
      if (useType == "full") tile.hideChooseTile();
      if (howManyChoose <= 0) tiles[0].cancelChoose();
    };

    for (let i = 0; i < tiles.length; i++) {
      tiles[i].showChooseTile(this.type, func);
    }
    console.log(this);
  }
  add() {
    this.cnt++;
  }
  sub() {
    this.cnt--;
  }
  delete() {}
}

const itemInfromList = {
  cabbage_seed: {
    name: "cabbage_seed",
    type: "seed",
    inform: { ...cropInform.cabbage },
  },
  carrot_seed: {
    name: "carrot_seed",
    type: "seed",
    inform: { ...cropInform.carrot },
  },
  water: {
    name: "water",
    type: "item",
    inform: {
      work: {
        type: "moisture",
        amount: 20,
      },
    },
  },
  nutrient: {
    name: "nutrient",
    type: "item",
    inform: {
      work: {
        type: "nutrition",
        amount: 20,
      },
    },
  },
};
console.log(itemInfromList);
// 인벤토리

const inventoryHtml = document.querySelector(".inventory");

const invenInformContainerHtml = document.querySelector(
  ".inventory .inform-container"
);
const invenItemContainerHtml = document.querySelector(
  ".inventory .item-container"
);

const inventory = {
  //인벤토리 가로열과 세로열
  rowLength: 6,
  colLength: 1,
  choosedItem: undefined,
  list: [],
  isOpen: false,
  chooseItem: function (item) {
    this.choosedItem = item;
    this.drawInform(item);
  },
  open: function (type, choosedItem) {
    //html그리기
    type = type || "main";

    if (!inventoryHtml.classList.contains("hidden")) {
      console.log("have opend!");
      return;
    } else {
      this.choosedItem = choosedItem;
      inventoryHtml.classList.toggle("hidden");
    }
    this.drawItem(type);
    this.isOpen = true;
  },
  drawItem: function (type) {
    const itemListHtml = document.createElement("div");
    const toDrawList = [];

    for (let i = 0; i < this.list.length; i++) {
      if (type == "main" || this.list[i].type == type) {
        toDrawList.push(this.list[i]);
      }
    }

    console.log(toDrawList);
    itemListHtml.classList.add("item-list");

    // 현재 인벤토리의 수에따라 세로열 정하기
    this.colLength =
      parseInt(toDrawList.length / this.rowLength) + 1;

    for (let i = 0; i < this.colLength; i++) {
      const rowHtml = createElementWithClass(
        "div",
        `item-row id-${i}`
      );
      loop: for (let j = 0; j < this.rowLength; j++) {
        const index = i * this.rowLength + j;

        const itemHtml = document.createElement("div");
        itemHtml.classList = `item id-${index}`;
        const imgHtml = createElementWithClass(
          "div",
          "item-img"
        );
        const nameHtml = createElementWithClass(
          "div",
          "item-name"
        );
        const cntHtml = createElementWithClass(
          "div",
          "item-cnt"
        );

        itemHtml.append(nameHtml);
        itemHtml.append(cntHtml);
        rowHtml.append(itemHtml);
        if (!toDrawList[index]) {
          continue loop;
        }

        itemHtml.addEventListener("click", () => {
          console.log(toDrawList[index]);
          inventory.chooseItem(toDrawList[index]);
        });
        nameHtml.innerHTML = toDrawList[index].name;
        cntHtml.innerHTML = toDrawList[index].cnt;
      }
      itemListHtml.append(rowHtml);
    }
    invenItemContainerHtml.append(itemListHtml);
  },
  close: function () {
    invenItemContainerHtml.innerHTML = "";
    inventoryHtml.classList.add("hidden");
    this.isOpen = false;
    this.choosedItem = undefined;
    this.closeInform();
  },
  deleteItem: function () {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].cnt <= 0) {
        this.list.splice(i, 1);
        i--;
      }
    }
  },
  subItem: function (item) {
    item.cnt--;
    if (item.cnt <= 0) {
      this.deleteItem();
    }
  },
  addItem: function (item) {
    for (let i = 0; i < this.list.length; i++) {
      if (
        this.list[i].name == item.name &&
        this.list[i].cnt < 99
      ) {
        this.list[i].cnt++;
        return;
      }
    }
    this.list.push(new Item(item));
  },
  drawInform: function (item) {
    // basic inform
    const itemImg =
      invenInformContainerHtml.querySelector(".item-img");
    const itemName =
      invenInformContainerHtml.querySelector(".item-name");
    const itemCnt =
      invenInformContainerHtml.querySelector(".item-cnt");

    //detail inform
    const article = invenInformContainerHtml.querySelector(
      ".detail-inform .article"
    );

    //btns

    itemName.innerHTML = item.name || "";
    itemCnt.innerHTML = item.cnt || "";
    article.innerHTML = item.inform.comment || "";
  },
  closeInform: function () {
    this.drawInform({ inform: {} });
  },
  toggleType: function (type) {
    const tabList =
      inventoryHtml.querySelector(".tab-list");
    const tabs = tabList.querySelectorAll(".tab");

    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].classList.contains("selected"))
        tabs[i].classList.toggle("selected");
      if (tabs[i].classList.contains(`tab-${type}`))
        tabs[i].classList.toggle("selected");
    }

    invenItemContainerHtml.innerHTML = "";
    this.drawItem(type);
  },
};

for (let i = 0; i < 1000; i++) {
  inventory.addItem({
    name: "cabbage_seed",
    type: itemInfromList["cabbage" + "_seed"].type,
    inform: itemInfromList["cabbage" + "_seed"].inform,
  });
}
for (let i = 0; i < 1000; i++) {
  inventory.addItem({
    name: "water",
    type: itemInfromList["water"].type,
    inform: itemInfromList["water"].inform,
  });
}
for (let i = 0; i < 1000; i++) {
  inventory.addItem({
    name: "nutrient",
    type: itemInfromList["nutrient"].type,
    inform: itemInfromList["nutrient"].inform,
  });
}

inventory.open("main");

//inventory init
(function init(inventory) {
  const tabListHtml = document.querySelector(
    ".inventory .tab-list"
  );
  const useBtn = invenInformContainerHtml.querySelector(
    ".btns .use-item"
  );
  const tabBtns = tabListHtml.querySelectorAll("div");
  const closeBtn = document.querySelector(".close-btn");
  const openBtn = document.querySelector(".open-btn");

  for (let i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener("click", () => {
      inventory.isOpen &&
        inventory.toggleType(tabBtns[i].innerHTML);
    });
  }

  useBtn.addEventListener("click", () => {
    if (!inventory.choosedItem) return;
    inventory.choosedItem.returnFunc(
      inventory.choosedItem.type
    );
  });

  closeBtn &&
    closeBtn.addEventListener("click", () => {
      inventory.close();
    });
  openBtn &&
    openBtn.addEventListener("click", () => {
      inventory.open();
    });
})(inventory);

//choose tile and plant

//class와 함께 엘리먼트 생성
function createElementWithClass(type, name) {
  const html = document.createElement(type);
  html.classList = name;
  return html;
}
