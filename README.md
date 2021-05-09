# QRCode
QRコードを作成するJavascript
QRコード化できるのは半角英数字記号のみで構成された文字列だけで、漢字モードには対応していない。

1. QRCode.js を読み込むとQRCode というオブジェクトが生成される
2. var qc = QRCode.create(); を実行する事で、QRCodeを操作するためのインスタンスが得られる
3. 上記インスタンスに定義されている関数は以下の通り。

qc.ver(version)	
使用するQRコードのバージョンを設定する。versionには1～40の数字、もしくは、文字列'auto'を与えることができる。'auto'を与えた場合は、データ長を格納可能な最小のバージョン番号が選択される（ただし、その分計算時間がかかる）。引数を渡さなかった場合は、現在設定されているバージョン番号が返る。

qc.ecc(level)
誤り修正レベルを設定する。levelには{'L','M','Q','H'}のいずれかの文字列を与えることができる。初期値は'H'。引数を渡さなかった場合は、現在設定されている誤り修正レベルが返る。

qc.mask(number)
使用するマスク種別を設定する。numberには0～7のいずれかの数字、文字列'auto'を与えることができる。'auto'を与えた場合は、QRコードの仕様に従って最適なマスクが選択される（ただし、その分計算時間がかかる）。引数を渡さなかった場合は、現在設定されているマスク種別が返る。

qc.encode(data)
データを渡してエンコードする。dataは半角英数字記号で構成された文字列。

qc.writeTo(canvas)
エンコードした内容をcanvasに描き出す。qc.encode 実行後に実施する必要がある。なお、QRコードの仕様上、Canvasは1辺の長さが「17 + version * 4 + 8」の倍数であることが望ましい（別に、それ以外のサイズでもかまわないけれど、無駄な余白ができる）

qc.attach(className)
classNameで指定したクラス名を持つタグの中にimgタグでQRコードを埋め込む。QRコード化するデータは、当該タグのdata-value属性、もしくは、data-link属性で設定する。
data-value属性が存在する場合にはその属性値そのものが、data-link属性が存在する場合には、当該属性値で指定された「idを持つ<a>タグのhref属性の値」がQRコード化される。
QRコードのサイズはdata-size属性で設定する。data-size属性が見て意義の場合は、1マスが4×4ピクセルのQRコードが出力される。
なお、引数なしのqc.ver()、qc.ecc()、qc.mask()以外の関数は自身のインスタンスを返すため、メソッドチェーンで繋げることが可能。
  
◆使用例
【キャンバスに描き出す例】
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=Shift_JIS"> 
<script type="text/javascript" src="./js/QRCode.js"></script>
</head>
<body>
<canvas id="qrcode" width="400" height="400"></canvas>
<script type="text/javascript">
(function(){
    var canvas = document.getElementById('qrcode');
    var version = 'auto';   // バージョンを指定して作成する場合は1～40の値を入れる
    var ecc = 'H';          // 誤り修正レベル(LMQH)
    var mask = 'auto';      // マスク種別を指定して作成する場合は0～7の値を入れる
    var data = 'http://www.google.com';    // QRコードに書き出したいデータ
 
    QRCode.create()
    .ver(version)
    .ecc(ecc)
    .mask(mask)
    .encode(data)
    .writeTo(canvas);
})();
</script>
</body>
</html>

【特定の<A>タグのリンク先URLをQRコード化する例】
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=Shift_JIS"> 
<script type="text/javascript" src="./js/QRCode.js"></script>
</head>
<body>
<a href="http://www.google.com" id="qrcode-target">Google</a>
<div class="container" data-link="qrcode-target">ここにQRコードが埋め込まれる</div>
<script type="text/javascript">
(function(){
    // 設定は省略しても初期値で動く
    QRCode.create().attach('container');
})();
</script>
</body>
</html>
  
【data-value属性の値をQRコード化する例】
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=Shift_JIS"> 
<script type="text/javascript" src="./js/QRCode.js"></script>
</head>
<body>
<div class="qrcode" data-value="http://www.google.com"></div>
<div class="qrcode" data-value="https://googledrive.com"></div>
<script type="text/javascript">
(function(){
    // attachの引数を省略した場合には
    // qrcode というクラス名を持つ要素が選択される
    QRCode.create().attach();
})();
</script>
</body>
</html>
