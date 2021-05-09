var QRCode = {};
(function(){
	'use strict';

	// 定数の宣言
	var CONST = {};

	// マスク処理に使用する判別式
	CONST.MASK = [
		function(r,c) {
			return (r + c) % 2 == 0 ? 1 : 0;
		},
		function(r,c) {
			return r % 2 == 0 ? 1 : 0;
		},
		function(r,c) {
			return c % 3 == 0 ? 1 : 0;
		},
		function(r,c) {
			return (r + c) % 3 == 0 ? 1 : 0;
		},
		function(r,c) {
			return ((~~(r / 2)) + (~~(c / 3))) % 2 == 0 ? 1 : 0;
		},
		function(r,c) {
			return r * c % 2 + r * c % 3 == 0 ? 1 : 0;
		},
		function(r,c) {
			return (r * c % 2 + r * c % 3) % 2 == 0 ? 1 : 0;
		},
		function(r,c) {
			return (r * c % 3 + ( r + c ) % 2) % 2 == 0 ? 1 : 0;
		}
	];

	// 英数字モードでの変換表
	CONST.CHARCODE = {
		'0': 0,'1': 1,'2': 2,'3': 3,'4': 4,'5': 5,'6': 6,'7': 7,'8': 8,'9': 9,
		'A':10,'B':11,'C':12,'D':13,'E':14,'F':15,'G':16,'H':17,'I':18,'J':19,
		'K':20,'L':21,'M':22,'N':23,'O':24,'P':25,'Q':26,'R':27,'S':28,'T':29,
		'U':30,'V':31,'W':32,'X':33,'Y':34,'Z':35,' ':36,'$':37,'%':38,'*':39,
		'+':40,'-':41,'.':42,'/':43,':':44
	};

	// 各レベルにおけるRSブロック
	// 配列の中の要素が1つの場合は、RSブロックの分割無し
	// 配列の中の要素が2つ以上の場合は、
	// [ブロックあたりの要素数, ブロック数]
	// の順で記載
	CONST.RSBLOCK = [
		{ // 1
			L:{DATA:[19],ECC:[7]},
			M:{DATA:[16],ECC:[10]},
			Q:{DATA:[13],ECC:[13]},
			H:{DATA:[9],ECC:[17]}
		},
		{ // 2
			L:{DATA:[34],ECC:[10]},
			M:{DATA:[28],ECC:[16]},
			Q:{DATA:[22],ECC:[22]},
			H:{DATA:[16],ECC:[28]}
		},
		{ // 3
			L:{DATA:[55],ECC:[15]},
			M:{DATA:[44],ECC:[26]},
			Q:{DATA:[17,2],ECC:[18,2]},
			H:{DATA:[13,2],ECC:[22,2]}
		},
		{ // 4
			L:{DATA:[80],ECC:[20]},
			M:{DATA:[32,2],ECC:[18,2]},
			Q:{DATA:[24,2],ECC:[26,2]},
			H:{DATA:[9,4],ECC:[16,4]}
		},
		{ // 5
			L:{DATA:[108],ECC:[26]},
			M:{DATA:[43,2],ECC:[24,2]},
			Q:{DATA:[15,2,16,2],ECC:[18,4]},
			H:{DATA:[11,2,12,2],ECC:[22,4]}
		},
		{ // 6
			L:{DATA:[68,2],ECC:[18,2]},
			M:{DATA:[27,4],ECC:[16,4]},
			Q:{DATA:[19,4],ECC:[24,4]},
			H:{DATA:[15,4],ECC:[28,4]}
		},
		{ // 7
			L:{DATA:[78,2],ECC:[20,2]},
			M:{DATA:[31,4],ECC:[18,4]},
			Q:{DATA:[14,2,15,4],ECC:[18,6]},
			H:{DATA:[13,4,14,1],ECC:[26,5]}
		},
		{ // 8
			L:{DATA:[97,2],ECC:[24,2]},
			M:{DATA:[38,2,39,2],ECC:[22,4]},
			Q:{DATA:[18,4,19,2],ECC:[22,6]},
			H:{DATA:[14,4,15,2],ECC:[26,6]}
		},
		{ // 9
			L:{DATA:[116,2],ECC:[30,2]},
			M:{DATA:[36,3,37,2],ECC:[22,5]},
			Q:{DATA:[16,4,17,4],ECC:[20,8]},
			H:{DATA:[12,4,13,4],ECC:[24,8]}
		},
		{ // 10
			L:{DATA:[68,2,69,2],ECC:[18,4]},
			M:{DATA:[43,4,44,1],ECC:[26,5]},
			Q:{DATA:[19,6,20,2],ECC:[24,8]},
			H:{DATA:[15,6,16,2],ECC:[28,8]}
		},
		{ // 11
			L:{DATA:[81,4],ECC:[20,4]},
			M:{DATA:[50,1,51,4],ECC:[30,5]},
			Q:{DATA:[22,4,23,4],ECC:[28,8]},
			H:{DATA:[12,3,13,8],ECC:[24,11]}
		},
		{ // 12
			L:{DATA:[92,2,93,2],ECC:[24,4]},
			M:{DATA:[36,6,37,2],ECC:[22,8]},
			Q:{DATA:[20,4,21,6],ECC:[26,10]},
			H:{DATA:[14,7,15,4],ECC:[28,11]}
		},
		{ // 13
			L:{DATA:[107,4],ECC:[26,4]},
			M:{DATA:[37,8,38,1],ECC:[22,9]},
			Q:{DATA:[20,8,21,4],ECC:[24,12]},
			H:{DATA:[11,12,12,4],ECC:[22,16]}
		},
		{ // 14
			L:{DATA:[115,3,116,1],ECC:[30,4]},
			M:{DATA:[40,4,41,5],ECC:[24,9]},
			Q:{DATA:[16,11,17,5],ECC:[20,16]},
			H:{DATA:[12,11,13,5],ECC:[24,16]}
		},
		{ // 15
			L:{DATA:[87,5,88,1],ECC:[22,6]},
			M:{DATA:[41,5,42,5],ECC:[24,10]},
			Q:{DATA:[24,5,25,7],ECC:[30,12]},
			H:{DATA:[12,11,13,7],ECC:[24,18]}
		},
		{ // 16
			L:{DATA:[98,5,99,1],ECC:[24,6]},
			M:{DATA:[45,7,46,3],ECC:[28,10]},
			Q:{DATA:[19,15,20,2],ECC:[24,17]},
			H:{DATA:[15,3,16,13],ECC:[30,16]}
		},
		{ // 17
			L:{DATA:[107,1,108,5],ECC:[28,6]},
			M:{DATA:[46,10,47,1],ECC:[28,11]},
			Q:{DATA:[22,1,23,15],ECC:[28,16]},
			H:{DATA:[14,2,15,17],ECC:[28,19]}
		},
		{ // 18
			L:{DATA:[120,5,121,1],ECC:[30,6]},
			M:{DATA:[43,9,44,4],ECC:[26,13]},
			Q:{DATA:[22,17,23,1],ECC:[28,18]},
			H:{DATA:[14,2,15,19],ECC:[28,21]}
		},
		{ // 19
			L:{DATA:[113,3,114,4],ECC:[28,7]},
			M:{DATA:[44,3,45,11],ECC:[26,14]},
			Q:{DATA:[21,17,22,4],ECC:[26,21]},
			H:{DATA:[13,9,14,16],ECC:[26,25]}
		},
		{ // 20
			L:{DATA:[107,3,108,5],ECC:[28,8]},
			M:{DATA:[41,3,42,13],ECC:[26,16]},
			Q:{DATA:[24,15,25,5],ECC:[30,20]},
			H:{DATA:[15,15,16,10],ECC:[28,25]}
		},
		{ // 21
			L:{DATA:[116,4,117,4],ECC:[28,8]},
			M:{DATA:[42,17],ECC:[26,17]},
			Q:{DATA:[22,17,23,6],ECC:[28,23]},
			H:{DATA:[16,19,17,6],ECC:[30,25]}
		},
		{ // 22
			L:{DATA:[111,2,112,7],ECC:[28,9]},
			M:{DATA:[46,17],ECC:[28,17]},
			Q:{DATA:[24,7,25,16],ECC:[30,23]},
			H:{DATA:[13,34],ECC:[24,34]}
		},
		{ // 23
			L:{DATA:[121,4,122,5],ECC:[30,9]},
			M:{DATA:[47,4,48,14],ECC:[28,18]},
			Q:{DATA:[24,11,25,14],ECC:[30,25]},
			H:{DATA:[15,16,16,14],ECC:[30,30]}
		},
		{ // 24
			L:{DATA:[117,6,118,4],ECC:[30,10]},
			M:{DATA:[45,6,46,14],ECC:[28,20]},
			Q:{DATA:[24,11,25,16],ECC:[30,27]},
			H:{DATA:[16,30,17,2],ECC:[30,32]}
		},
		{ // 25
			L:{DATA:[106,8,107,4],ECC:[26,12]},
			M:{DATA:[47,8,48,13],ECC:[28,21]},
			Q:{DATA:[24,7,25,22],ECC:[30,29]},
			H:{DATA:[15,22,16,13],ECC:[30,35]}
		},
		{ // 26
			L:{DATA:[114,10,115,2],ECC:[28,12]},
			M:{DATA:[46,19,47,4],ECC:[28,23]},
			Q:{DATA:[22,28,23,6],ECC:[28,34]},
			H:{DATA:[16,33,17,4],ECC:[30,37]}
		},
		{ // 27
			L:{DATA:[122,8,123,4],ECC:[30,12]},
			M:{DATA:[45,22,46,3],ECC:[28,25]},
			Q:{DATA:[23,8,24,26],ECC:[30,34]},
			H:{DATA:[15,12,16,28],ECC:[30,40]}
		},
		{ // 28
			L:{DATA:[117,3,118,10],ECC:[30,13]},
			M:{DATA:[45,3,46,23],ECC:[28,26]},
			Q:{DATA:[24,4,25,31],ECC:[30,35]},
			H:{DATA:[15,11,16,31],ECC:[30,42]}
		},
		{ // 29
			L:{DATA:[116,7,117,7],ECC:[30,14]},
			M:{DATA:[45,21,46,7],ECC:[28,28]},
			Q:{DATA:[23,1,24,37],ECC:[30,38]},
			H:{DATA:[15,19,16,26],ECC:[30,45]}
		},
		{ // 30
			L:{DATA:[115,5,116,10],ECC:[30,15]},
			M:{DATA:[47,19,48,10],ECC:[28,29]},
			Q:{DATA:[24,15,25,25],ECC:[30,40]},
			H:{DATA:[15,23,16,25],ECC:[30,48]}
		},
		{ // 31
			L:{DATA:[115,13,116,3],ECC:[30,16]},
			M:{DATA:[46,2,47,29],ECC:[28,31]},
			Q:{DATA:[24,42,25,1],ECC:[30,43]},
			H:{DATA:[15,23,16,28],ECC:[30,51]}
		},
		{ // 32
			L:{DATA:[115,17],ECC:[30,17]},
			M:{DATA:[46,10,47,23],ECC:[28,33]},
			Q:{DATA:[24,10,25,35],ECC:[30,45]},
			H:{DATA:[15,19,16,35],ECC:[30,54]}
		},
		{ // 33
			L:{DATA:[115,17,116,1],ECC:[30,18]},
			M:{DATA:[46,14,47,21],ECC:[28,35]},
			Q:{DATA:[24,29,25,19],ECC:[30,48]},
			H:{DATA:[15,11,16,46],ECC:[30,57]}
		},
		{ // 34
			L:{DATA:[115,13,116,6],ECC:[30,19]},
			M:{DATA:[46,14,47,23],ECC:[28,37]},
			Q:{DATA:[24,44,25,7],ECC:[30,51]},
			H:{DATA:[16,59,17,1],ECC:[30,60]}
		},
		{ // 35
			L:{DATA:[121,12,122,7],ECC:[30,19]},
			M:{DATA:[47,12,48,26],ECC:[28,38]},
			Q:{DATA:[24,39,25,14],ECC:[30,53]},
			H:{DATA:[15,22,16,41],ECC:[30,63]}
		},
		{ // 36
			L:{DATA:[121,6,122,14],ECC:[30,20]},
			M:{DATA:[47,6,48,34],ECC:[28,40]},
			Q:{DATA:[24,46,25,10],ECC:[30,56]},
			H:{DATA:[15,2,16,64],ECC:[30,66]}
		},
		{ // 37
			L:{DATA:[122,17,123,4],ECC:[30,21]},
			M:{DATA:[46,29,47,14],ECC:[28,43]},
			Q:{DATA:[24,49,25,10],ECC:[30,59]},
			H:{DATA:[15,24,16,46],ECC:[30,70]}
		},
		{ // 38
			L:{DATA:[122,4,123,18],ECC:[30,22]},
			M:{DATA:[46,13,47,32],ECC:[28,45]},
			Q:{DATA:[24,48,25,14],ECC:[30,62]},
			H:{DATA:[15,42,16,32],ECC:[30,74]}
		},
		{ // 39
			L:{DATA:[117,20,118,4],ECC:[30,24]},
			M:{DATA:[47,40,48,7],ECC:[28,47]},
			Q:{DATA:[24,43,25,22],ECC:[30,65]},
			H:{DATA:[15,10,16,67],ECC:[30,77]}
		},
		{ // 40
			L:{DATA:[118,19,119,6],ECC:[30,25]},
			M:{DATA:[47,18,48,31],ECC:[28,49]},
			Q:{DATA:[24,34,25,34],ECC:[30,68]},
			H:{DATA:[15,20,16,61],ECC:[30,81]}
		}
	];

	// 各レベルにおける位置合わせパタン座標
	CONST.ALIGNMENT = [
		[],
		[6,18],
		[6,22],
		[6,26],
		[6,30],
		[6,34],
		[6,22,38],
		[6,24,42],
		[6,26,46],
		[6,28,50],
		[6,30,54],
		[6,32,58],
		[6,34,62],
		[6,26,46,66],
		[6,26,48,70],
		[6,26,50,74],
		[6,30,54,78],
		[6,30,56,82],
		[6,30,58,86],
		[6,34,62,90],
		[6,28,50,72,94],
		[6,26,50,74,98],
		[6,30,54,78,102],
		[6,28,54,80,106],
		[6,32,58,84,110],
		[6,30,58,86,114],
		[6,34,62,90,118],
		[6,26,50,74,98,122],
		[6,30,54,78,102,126],
		[6,26,52,78,104,130],
		[6,30,56,82,108,134],
		[6,34,60,86,112,138],
		[6,30,58,86,114,142],
		[6,34,62,90,118,146],
		[6,30,54,78,102,126,150],
		[6,24,50,76,102,128,154],
		[6,28,54,80,106,132,158],
		[6,32,58,84,110,136,162],
		[6,26,54,82,110,138,166],
		[6,30,58,86,114,142,170]
	];
	
	// 未定義チェック
	var defined = function(v) {
		return (function(undefined) {
			return v !== undefined;
		})();
	};

	// ビットデータを管理するクラス
	var bitArray = function(size) {
		var me = this;
		var buf = size ? new Array(size) : new Array();

		me.push = function(b, sz) {
			if(!sz) {
				buf.push(b ? 1 : 0);
			}
			else {
				for(var i = sz - 1; i >= 0; i--) {
					buf.push((b >> i)&1);
				}
			}
			return me;
		};

		me.length = function() {
			return buf.length;
		};

		me.get = function(i) {
			return buf[i];
		};

		me.toBytes = function() {
			var bytes = new Array();
			for(var i = 0; i < buf.length; i += 8) {
				var byte = 0;
				for(var j = 0; j < 8; j++) {
					if(i + j < buf.length && buf[i + j]) {
						byte |= (1 << ( 7 - j ));
					}
				}
				bytes.push(byte);
			}
			return bytes;
		};
	};

	// BCH符号の計算で使用する生成多項式
	var BCH10 = [1,0,1,0,0,1,1,0,1,1,1];		// 形式情報用
	var BCH12 = [1,1,1,1,1,0,0,1,0,0,1,0,1];	// 型番情報用

	// BCH符号の計算
	var BCH = function(data, data_size, mask) {
		var org = new Array(data_size);
		var i,j;
		for(i = 0; i < data_size; i++) {
			org[i] = (data >> (data_size - i - 1)) & 1;
		}
		var ecc = new Array(mask.length - 1);
		for(i = 0; i < ecc.length; i++) {
			ecc[i] = 0;
		}
		ecc = org.concat(ecc);
		while(1) {
		for(i = 0; i < ecc.length; i++) {
				if(ecc[i]) {
					break;
				}
			}
			if(i + mask.length > ecc.length) {
				break;
			}
			for(j = 0; j < mask.length; j++) {
				ecc[i + j] ^= mask[j];
			}
		}
		return org.concat(ecc.slice(data_size));
	}

	// リードソロモンによる誤り検出符号作成
	var ReedSolomon = (function(){

		// ガロア体
		var GaloisField = (function() {
			var pow = new Array(256);		// 正引き用
			var root = new Array(256);		// 逆引き用
			var s = (1 << 4) | (1 << 3) | (1 << 2) | 1; // a^8 = a^4 + a^3 + a^2 + 1
			var n = 1;

			root[0] = void 0;
			for(var i = 0; i < 255; i++) {
				pow[i] = n;
				root[n] = i;
				n <<= 1;
				n = ((n >> 8) * s) ^ (n & 0xff);
			}
			pow[i] = n;

			var gf = {};
			
			gf.pow = function(i) {
				return pow[i % 255];
			};
			
			gf.root = function(i) {
				if(i == 0) {
					throw new Error('invalid argument.');
				}
				return root[i];
			};

			gf.sum = function(i, j) {
				return gf.root(gf.pow(i) ^ gf.pow(j));
			};
			
			return gf;
		})();

		var rs = {};

		// バイト配列から誤り訂正符号の配列を返す
		rs.fromBytes = function(bytes, eccSize) {
			var i,j;

			// 生成多項式の指数の配列を作成する
			var index = (function(){
				// array (例えば、(0, 25, 1) ) に (0, c) を掛ける演算
				var mul = function(array, c) {
					var ret = new Array();
					ret.push(array[0]);
					for(var i = 1; i < array.length; i++) {
						ret.push(GaloisField.sum(array[i], array[i-1] + c));
					}
					var e = array[array.length-1] + c;
					while(e > 0xff) {
						e -= 0xff;
					}
					ret.push(e);
					return ret;
				};
				var array = [0, 0];
				for(var i = 1; i < eccSize; i++) {
					array = mul(array, i);
				}
				array.shift();
				return array;
			})();

			var length = bytes.length > index.length ? bytes.length : index.length;
			var tmp = new Array(length + 1);
			for(i = 0; i < bytes.length; i++) {
				tmp[i] = bytes[i];
			}
			for(i = bytes.length; i < tmp.length; i++) {
				tmp[i] = 0;
			}
			for(i = 0; i < bytes.length; i++) {
				if(tmp[0] != 0) {
					var j;
					var div = GaloisField.root(tmp[0]);
					for(j = 0; j < index.length; j++) {
						tmp[j] = tmp[j + 1] ^ GaloisField.pow(index[j] + div);
					}
					for(j = index.length; j < tmp.length - 1; j++) {
						tmp[j] = tmp[j + 1];
					}
				}
				else {
					for(j = 0; j < tmp.length - 1; j++) {
						tmp[j] = tmp[j + 1];
					}
				}
			}

			// 誤り訂正符合の配列を返す
			return tmp.slice(0, index.length);
		};
		return rs;
	})();

	// マスクの評価を計算する関数
	var calcMaskEval = function(map) {
		var v = 0;
		var r,c;
		var size = map.length;

		// モジュール数＝(5+i)
		for(r = 0; r < size; r++) {
			var a = 0;
			var b = 0;
			for(c = 0; c < size; c++) {
				if(map[r][c]) {
					a = 0;
					b++;
					if(b == 5) {
						v -= 2;
					}
					else if(b > 5) {
						v--;
					}
				}
				else {
					a++;
					b = 0;
					if(a == 5) {
						v -= 2;
					}
					else if(b > 5) {
						v--;
					}
				}
			}
		}
		for(c = 0; c < size; c++) {
			var a = 0;
			var b = 0;
			for(r = 0; r < size; r++) {
				if(map[r][c]) {
					a = 0;
					b++;
					if(b == 5) {
						v -= 2;
					}
					else if(b > 5) {
						v--;
					}
				}
				else {
					a++;
					b = 0;
					if(a == 5) {
						v -= 2;
					}
					else if(b > 5) {
						v--;
					}
				}
			}
		}

		// ブロックサイズ ＝2×2
		for(r = 0; r < size - 1; r++) {
			for(c = 0; c < size - 1; c++) {
				if(map[r][c] == map[r][c+1] &&
				   map[r][c] == map[r+1][c] &&
				   map[r][c] == map[r+1][c+1]) {
					v -= 3;
				}
			}
		}

		// 位置マーク
		for(r = 0; r < size - 6; r++) {
			for(c = 0; c < size - 6; c++) {
				if((map[r][c] &&
				  !map[r+1][c] &&
				   map[r+2][c] &&
				   map[r+3][c] &&
				   map[r+4][c] &&
				  !map[r+5][c] &&
				   map[r+6][c]) && (
						(r >=4 &&
						!map[r-4][c] &&
						!map[r-3][c] &&
						!map[r-2][c] &&
						!map[r-1][c]) ||
						(r + 10 < size &&
						!map[r+7][c] &&
						!map[r+8][c] &&
						!map[r+9][c] &&
						!map[r+10][c])
					)
				){
					v -= 40;
				}
				if((map[r][c] &&
				  !map[r][c+1] &&
				   map[r][c+2] &&
				   map[r][c+3] &&
				   map[r][c+4] &&
				  !map[r][c+5] &&
				   map[r][c+6]) && (
						(c >=4 &&
						!map[r][c-4] &&
						!map[r][c-3] &&
						!map[r][c-2] &&
						!map[r][c-1]) ||
						(c + 10 < size &&
						!map[r][c+7] &&
						!map[r][c+8] &&
						!map[r][c+9] &&
						!map[r][c+10])
					)
				){
					v -= 40;
				}
			}
		}

		// 黒の割合
		var black_count = 0;
		for(r = 0; r < size; r++) {
			for(c = 0; c < size; c++) {
				if(map[r][c]) {
					black_count++;
				}
			}
		}
		v -= (~~(Math.abs(black_count * 100 / (size * size) - 50) / 5)) * 10;
		return v;
	};

	// 数字モードのデータを作成する
	var createNumData = function(data, ver, bytecount) {
		var bits = new bitArray();
		var i;

		// 数字モードの識別子
		bits.push(0x01, 4);

		// 文字列長の記録
		bits.push(data.length,
			ver < 10 ? 10:
			ver < 12 ? 12:
			14
		);

		for(i = 0; i < data.length; i += 3) {
			if(i + 3 <= data.length) {
				bits.push(parseInt(data.substr(i, 3)), 10);
			}
			else if(i + 2 <= data.length) {
				bits.push(parseInt(data.substr(i, 2)), 7);
			}
			else {
				bits.push(parseInt(data.substr(i, 1)), 4);
			}
		}

		// 終端パタンの挿入
		if(bits.length() + 4 < bytecount * 8) {
			bits.push(0,4);
		}
		else if(bits.length() > bytecount * 8) {
			return void 0;
		}

		return bits;
	};
	
	// 英数字モードのデータを作成する
	var createStringData = function(data, ver, bytecount) {
		var bits = new bitArray();
		var i;

		// 英数字モードの識別子
		bits.push(0x02, 4);

		// 文字列長の記録
		bits.push(data.length,
			ver < 10 ? 9:
			ver < 27 ? 11:
			13
		);

		// 大文字に変換
		data = data.toUpperCase();

		for(i = 0; i < data.length; i+= 2) {
			if( i + 1 < data.length) {
				bits.push(
					CONST.CHARCODE[data.charAt(i)]*45+
					CONST.CHARCODE[data.charAt(i+1)],11);
			}
			else {
				bits.push(CONST.CHARCODE[data.charAt(i)], 6);
			}
		}

		// 終端パタンの挿入
		if(bits.length() + 4 < bytecount * 8) {
			bits.push(0, 4);
		}
		else if(bits.length() > bytecount * 8) {
			return void 0;
		}

		return bits;
	};

	// 8ビットバイトモードのデータを作成する
	var create8bitByteData = function(data, ver, bytecount) {
		var bits = new bitArray();
		var i;

		// 8ビットバイトモードの識別子
		bits.push(0x04, 4);

		// 文字列長の記録
		bits.push(data.length,
			ver < 10 ? 8:
			ver < 27 ? 16:
			16
		);

		for(i = 0; i < data.length; i++) {
			bits.push(data.charCodeAt(i),8);
		}

		// 終端パタンの挿入
		if(bits.length() + 4 < bytecount * 8) {
			bits.push(0, 4);
		}
		else if(bits.length() > bytecount * 8) {
			return void 0;
		}

		return bits;
	};

	QRCode.create = function(){return new function() {
		var me = this;
		var bitmap = null;
		var ECC_LEVEL = 2;
		var VERSION = void 0;
		var MASK_TYPE = void 0;

		// バージョンの設定
		me.ver = function(v) {
			if(!defined(v)) {
				return VERSION;
			}
			if(typeof v === 'string') {
				if(v.match(/^[0-9]*$/)) {
					v = parseInt(v);
				}
				else if(v.toLowerCase() == 'auto') {
					VERSION = void 0
					return me;
				}
			}
			if(typeof v === 'number' && v > 0) {
				VERSION = v;
				return me;
			}
			throw new Error('invalid version.');
		};

		// 誤り訂正レベルの設定
		me.ecc = function(e) {
			var label = ['M', 'L', 'H', 'Q'];
			if(!defined(e)) {
				if(ECC_LEVEL >= 0 && ECC_LEVEL < label.length) {
					return label[ECC_LEVEL];
				}
			}
			else if(typeof e === 'number' && e >= 0 && e <= 4) {
				ECC_LEVEL = ~~e;
				return me;
			}
			else if(typeof e === 'string') {
				for(var i = 0; i < label.length; i++){
					if(e == label[i]) {
						ECC_LEVEL = i;
						return me;
					}
				}
			}
			throw new Error('invalid ecc level.');
		};

		// マスク種別の設定
		me.mask = function(m) {
			if(!defined(m)) {
				return MASK_TYPE;
			}
			else if(typeof m === 'string') {
				if(m.toLowerCase() === 'auto') {
					MASK_TYPE = void 0;
					return me;
				}
				else if(m.match(/^[0-9]*$/)) {
					m = parseInt(m);
				}
			}
			if(typeof m === 'number' && m >= 0 && m < CONST.MASK.length) {
				MASK_TYPE = m;
				return me;
			}
			throw new Error('invalid mask type.');
		};

		// QRコードのマッピング
		var mapping = function(version, bits, maskType, mask_fnc) {
			var r,c,i;
			var dr = -1;
			var length = bits.length();
			var size = 17 + version * 4;
			var align_pos = CONST.ALIGNMENT[version-1];

			var buf = new Array(size);
			for(r = 0; r < size; r++) {
				buf[r] = new Array(size);
			}

			// 位置検出パタンを埋める
			for(r = 0; r < 8; r++) {
				for(c = 0; c < 8; c++) {
					var bit = (
						c == 7 || 
						r == 7 || 
						( (r == 1 || r == 5) && c != 0 && c != 6) ||
						( r > 1 && r < 5 && (c == 1 || c == 5) )
					) ? 0 : 1;

					buf[r][c] = bit;
					buf[size - 1 - r][c] = bit;
					buf[r][size - 1 - c] = bit;
				}
			}

			// 位置合せパタンを埋める
			(function(){
				for(var cr = 0; cr < align_pos.length; cr++) {
					for(var cc = 0; cc < align_pos.length; cc++) {
						if(
							(align_pos[cr] < 8 && align_pos[cc] < 8)|| 
							(align_pos[cr] >= size - 8 && align_pos[cc] < 8)||
							(align_pos[cr] < 8 && align_pos[cc] >= size - 8)
						) {
							continue;
						}
						var left = align_pos[cc] - 2;
						var top = align_pos[cr] - 2;
						for(r = 0; r < 5; r++) {
							for(c = 0; c < 5; c++) {
								if(r == 0 || r == 4 || c == 0 || c == 4) {
									buf[top+r][left+c] = 1;
								}
								else if(r == 2 && c == 2) {
									buf[top+r][left+c] = 1;
								}
								else {
									buf[top+r][left+c] = 0;
								}
							}
						}
					}
				}
			})();

			// 暗モジュール
			buf[size-8][8] = 1;

			// タイミングパタンを埋める
			for(i = 8; i < size - 8; i++) {
				buf[i][6] = buf[6][i] = ((i&1) == 0 ? 1 : 0);
			}

			// 形式情報(15bit)の記入
			var code = BCH(((ECC_LEVEL & 3) << 3) + (maskType & 7), 5, BCH10);

			// 先頭5バイト＋誤り検出符号に101010000010010をXORした値が形式情報
			buf[8][0] = buf[size-1][8] = (1^code[0]);
			buf[8][1] = buf[size-2][8] = (0^code[1]);
			buf[8][2] = buf[size-3][8] = (1^code[2]);
			buf[8][3] = buf[size-4][8] = (0^code[3]);
			buf[8][4] = buf[size-5][8] = (1^code[4]);
			buf[8][5] = buf[size-6][8] = (0^code[5]);
			buf[8][7] = buf[size-7][8] = (0^code[6]);
			buf[8][8] = buf[8][size-8] = (0^code[7]);
			buf[7][8] = buf[8][size-7] = (0^code[8]);
			buf[5][8] = buf[8][size-6] = (0^code[9]);
			buf[4][8] = buf[8][size-5] = (1^code[10]);
			buf[3][8] = buf[8][size-4] = (0^code[11]);
			buf[2][8] = buf[8][size-3] = (0^code[12]);
			buf[1][8] = buf[8][size-2] = (1^code[13]);
			buf[0][8] = buf[8][size-1] = (0^code[14]);

			// 型番7以降は型番情報が載る
			if(version >= 7) {
				code = BCH(version, 6, BCH12);

				i = code.length - 1;
				for(r = 0; r < 6; r++) {
					for(c = size - 11; c < size - 8; c++) {
						buf[r][c] = buf[c][r] = (code[i--] != 0);
					}
				}
			}

			// データの書き込み
			r = size - 1;
			c = size - 1;
			i = 0;
			while(i < length) {
				if(!defined(buf[r][c])) {
					buf[r][c] = bits.get(i++) ^ mask_fnc(r,c);
				}
				else if(c > 0 && !defined(buf[r][c-1])) {
					buf[r][c-1] = bits.get(i++) ^ mask_fnc(r,c-1);
				}
				else if(i < length) {
					if(r <= 0 && dr < 0) {
						dr = 1;
						c -= 2;
						if(c == 6) {
							// タイミングパタンは飛ばす
							c --;
						}
						else if(c < 0) {
							throw new Error('too long data.');
						}
					}
					else if(r >= size - 1 && dr > 0) {
						dr = -1;
						c -= 2;
						if(c == 6) {
							// タイミングパタンは飛ばす
							c--;
						}
						else if(c < 0) {
							throw new Error('too long data.');
						}
					}
					else {
						r += dr;
						if(r == 6) {
							// タイミングパタンは飛ばす
							r += dr;
						}
					}
				}
			}

			// 未入力部分を 0 で埋める
			for(r = 0; r < size; r++) {
				for(c = 0; c < size; c++) {
					if(!defined(buf[r][c])) {
						buf[r][c] = mask_fnc(r,c);
					}
				}
			}

			return buf;
		};

		// QRコードの生成
		me.encode = function(data){
			var ecc_block_size;
			var data_block_size;
			var rsb_count;
			var i;
			var eccSize;
			var bytecount;
			var bytes;
			var version = VERSION;

			var initialize = function(data, ver) {
				// RSブロックに関する情報を取得する
				var rc_block_array = CONST.RSBLOCK[ver-1][me.ecc()];
				if(!defined(rc_block_array)) {
					throw new Error(
						'invalid params: version = ' + ver +
						', ecc level = ' + me.ecc());
				}

				// CONST.RSBLOCK情報からブロック数配列を作る
				var make_block_array = function(src_array) {
					var ret = new Array();
					var src_len = src_array.length;
					for(i = 0; i < src_len; i += 2) {
						if(i + 1 < src_len) {
							var num = src_array[i];
							var len = src_array[i + 1];
							for(var j = 0; j < len; j++) {
								ret.push(num);
							}
						}
						else {
							ret.push(src_array[i]);
						}
					}
					return ret;
				};
				ecc_block_size = make_block_array(rc_block_array.ECC);
				data_block_size = make_block_array(rc_block_array.DATA);
				rsb_count = ecc_block_size.length;
				if(rsb_count != data_block_size.length) {
					throw new Error('RS Block Info is invalid.');
				}

				// 誤り訂正符号数
				eccSize = ecc_block_size[0];
				for(i = 1; i < rsb_count; i++) {
					eccSize += ecc_block_size[i];
				}

				// 登録可能なデータ
				bytecount = data_block_size[0];
				for(i = 1; i < rsb_count; i++) {
					bytecount += data_block_size[i];
				}

				// 変換
				var bits = (function(){
					if(typeof data === 'number') {
						return createNumData(String(data), ver, bytecount);
					}
					else if(typeof data === 'string') {
						if(data.match(/^[0-9]*$/)) {
							return createNumData(data, ver, bytecount);
						}
						else if(data.match(/^[0-9A-Z\$\%\*\+\-\.\/\: ]*$/)) {
							return createStringData(data, ver, bytecount);
						}
						else if(data.match(/^[\x20-\x7e]*$/)) {
							return create8bitByteData(data, ver, bytecount);
						}
					}
					// 現時点では、数字モードか英数字モードのみに対応
					throw new Error('invalid data type.');
				})();

				return bits ? bits.toBytes() : void 0;
			};

			if(typeof version === 'number') {
				bytes = initialize(data, version);
			}
			else {
				// バージョン番号が指定されていない場合には
				// 最適なバージョンを探す
				for(version = 1; version <= 40; version++) {
					bytes = initialize(data, version);
					if(defined(bytes)) {
						break;
					}
				}
			}
			if(!defined(bytes)) {
				throw new Error('too long data.');
			}

			// 不足分にパディングを挿入する
			var padding_size = bytecount - bytes.length;
			for(i = 0; i < padding_size; i++) {
				bytes.push(i&1?17:236);
			}

			// RSブロックに分けて誤り訂正符号列を作成
			var data_block = new Array();
			var ecc_block = new Array();
			var offset = 0;
			for(i = 0; i < rsb_count; i++) {
				var tmp_bytes = bytes.slice(offset, offset + data_block_size[i]);
				data_block.push(tmp_bytes);
				ecc_block.push(ReedSolomon.fromBytes(tmp_bytes, ecc_block_size[i]));
				offset += data_block_size[i];
			}

			// RSブロックを組み合わせてビット配列に変換
			var bits = new bitArray();
			(function() {
				var data_exists = true;
				while(data_exists) {
					data_exists = false;
					for(i = 0; i < rsb_count; i++) {
						if(data_block[i].length > 0) {
							bits.push(data_block[i].shift(), 8);
							data_exists = true;
						}
					}
				}
				data_exists = true;
				while(data_exists) {
					data_exists = false;
					for(i = 0; i < rsb_count; i++) {
						if(ecc_block[i].length > 0) {
							bits.push(ecc_block[i].shift(), 8);
							data_exists = true;
						}
					}
				}
			})();

			if(!defined(MASK_TYPE)) {
				// 評価値のもっとも大きなマスクを適応したマップを保持する
				bitmap = mapping(version, bits, 0, CONST.MASK[0]);
				var max_ev = calcMaskEval(bitmap);
				for(i = 1; i < CONST.MASK.length; i++) {
					var tmp_bmp = mapping(version, bits, i, CONST.MASK[i]);
					var tmp_ev = calcMaskEval(tmp_bmp);
					if(tmp_ev > max_ev) {
						bitmap = tmp_bmp;
						max_ev = tmp_ev;
					}
				}
			}
			else {
				bitmap = mapping(version, bits, MASK_TYPE, CONST.MASK[MASK_TYPE]);
			}
			return me;
		};

		// キャンバスに書き出す
		me.writeTo = function(canvas) {
			if(typeof canvas.getContext !== 'function') {
				throw new Error('invalid argument');
			}
			var context = canvas.getContext('2d');
			var size = bitmap.length;
			var dx = ~~(canvas.width / (size + 8));
			var dy = ~~(canvas.height / (size + 8));
			var left = dx * 4;
			var top = dy * 4;
			context.fillStyle = '#ffffff';
			context.fillRect(0, 0, canvas.width, canvas.height);
			for(var r = 0; r < size; r++) {
				for(var c = 0; c < size; c++) {
					context.fillStyle = !defined(bitmap[r][c]) ? '#ff0000' : bitmap[r][c] ? '#000000' : '#ffffff';
					context.fillRect(left + c * dx, top + r * dy, dx, dy);
				}
			}
			return me;
		};
		
		// 引数のクラスを与えられたタグ内に img を差し込む
		// 引数が設定されてなかった場合には 'qrcode' クラス
		me.attach = function(className, context) {
			if(!defined(className)) {
				className = 'qrcode';
			}
			var elems = (context || document).getElementsByClassName(className);
			for(var i = 0; i < elems.length; i++) {
				var elem = elems[i];
				var data = elem.getAttribute('data-value');
				if(typeof data !== 'string' || data == '') {
					var a = document.getElementById(elem.getAttribute('data-link'));
					if(!a) {
						continue;
					}
					data = a.href;
					if(typeof data !== 'string' || data == '') {
						continue;
					}
				}
				me.encode(data);
				var size = elem.getAttribute('data-size');
				if(typeof size === 'string' && size != '') {
				    size = ~~size;
				}
				else {
					size = (bitmap.length + 8) * 4;
				}
				var img = document.createElement('img');
				var canvas = document.createElement('canvas');
				canvas.setAttribute('width', size);
				canvas.setAttribute('height', size);
				img.setAttribute('width', size);
				img.setAttribute('height', size);
				me.writeTo(canvas);
				img.setAttribute('src', canvas.toDataURL());
				elem.appendChild(img);
			}
			return me;
		};
	};};
})();
